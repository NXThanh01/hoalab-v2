import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/database/client";
import { activityLog, lessonContents } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";

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
  const parsed = lessonInput.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Dữ liệu bài giảng chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const { checkpoints, ...input } = parsed.data;
  const db = getDb();
  const [existing] = await db.select({ id: lessonContents.id }).from(lessonContents).where(eq(lessonContents.id, input.id)).limit(1);
  const values = { ...input, checkpointsJson: JSON.stringify(checkpoints), createdBy: auth.profile.userId, updatedAt: new Date().toISOString() };
  if (existing) await db.update(lessonContents).set(values).where(eq(lessonContents.id, input.id));
  else await db.insert(lessonContents).values(values);
  await db.insert(activityLog).values({ actorId: auth.profile.userId, action: `${input.status === "published" ? "Xuất bản" : "Lưu nháp"} video Bài ${input.lessonNumber}`, entityType: "lesson", entityId: input.id });
  return Response.json({ lesson: { ...values, checkpoints } }, { status: existing ? 200 : 201 });
}
