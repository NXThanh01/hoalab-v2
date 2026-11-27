import { desc, eq } from "drizzle-orm";
import { head } from "@vercel/blob";
import { z } from "zod";
import { getDb } from "@/database/client";
import { activityLog, lessonContents } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";
import { VIDEO_MAX_BYTES, getVideoBlobPath, videoContentTypes } from "@/shared/lesson-video";

export const dynamic = "force-dynamic";

const checkpointInput = z.object({
  id: z.string().min(1),
  timeSeconds: z.number().int().min(0),
  prompt: z.string().trim().min(5).max(1000),
  options: z.array(z.string().trim().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().trim().max(1500).default(""),
});

const lessonInput = z.object({
  id: z.string().min(3).max(100), gradeLevel: z.number().int().min(10).max(12),
  textbookSeries: z.string().trim().min(2).max(100), chapterId: z.string().min(2).max(100),
  lessonNumber: z.number().int().positive(), title: z.string().trim().min(2).max(300),
  videoUrl: z.string().trim().max(2000).default(""), status: z.enum(["draft", "published"]),
  checkpoints: z.array(checkpointInput).max(30).default([]),
});

const serialize = (row: typeof lessonContents.$inferSelect) => ({ ...row, checkpoints: JSON.parse(row.checkpointsJson) });

export async function GET() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const rows = await getDb().select().from(lessonContents).orderBy(desc(lessonContents.updatedAt));
  return Response.json({ lessons: rows.map(serialize) });
}

export async function POST(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = lessonInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Dữ liệu bài giảng chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const { checkpoints, ...input } = parsed.data;
  if (!input.videoUrl && input.status === "published") {
    return Response.json({ error: "Hãy tải video hoặc nhập liên kết HTTPS trước khi xuất bản." }, { status: 400 });
  }
  if (new Set(checkpoints.map((item) => item.timeSeconds)).size !== checkpoints.length || new Set(checkpoints.map((item) => item.id)).size !== checkpoints.length) {
    return Response.json({ error: "Mỗi checkpoint cần một mốc thời gian riêng." }, { status: 400 });
  }
  const path = getVideoBlobPath(input.videoUrl);
  if (input.videoUrl && !path && (!URL.canParse(input.videoUrl) || new URL(input.videoUrl).protocol !== "https:")) {
    return Response.json({ error: "Liên kết video phải dùng HTTPS." }, { status: 400 });
  }
  if (path) {
    if (!path.startsWith(`lessons/${input.id}/`)) return Response.json({ error: "Video không thuộc bài đang chỉnh sửa." }, { status: 400 });
    const blob = await head(path).catch(() => null);
    if (!blob || blob.size > VIDEO_MAX_BYTES || !videoContentTypes.includes(blob.contentType)) {
      return Response.json({ error: "Video chưa tải xong hoặc không đúng định dạng." }, { status: 400 });
    }
  }
  const db = getDb();
  const [existing] = await db.select({ id: lessonContents.id }).from(lessonContents).where(eq(lessonContents.id, input.id)).limit(1);
  const values = { ...input, checkpointsJson: JSON.stringify(checkpoints), createdBy: auth.profile.userId, updatedAt: new Date().toISOString() };
  await db.transaction(async (tx) => {
    await tx.insert(lessonContents).values(values).onConflictDoUpdate({ target: lessonContents.id, set: values });
    await tx.insert(activityLog).values({ actorId: auth.profile.userId, action: `${input.status === "published" ? "Xuất bản" : "Lưu nháp"} video Bài ${input.lessonNumber}`, entityType: "lesson", entityId: input.id });
  });
  return Response.json({ lesson: { ...values, checkpoints } }, { status: existing ? 200 : 201 });
}
