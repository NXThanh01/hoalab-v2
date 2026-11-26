import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/database/client";
import { activityLog, examFolders, exams } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";

export const dynamic = "force-dynamic";

const folderInput = z.object({
  name: z.string().trim().min(2).max(80),
  gradeLevel: z.number().int().min(10).max(12),
  description: z.string().trim().max(240).default(""),
  color: z.enum(["indigo", "emerald", "amber", "sky", "rose"]).default("indigo"),
});

async function listFolders() {
  const db = getDb();
  const rows = await db.select().from(examFolders).orderBy(desc(examFolders.createdAt));
  return Promise.all(rows.map(async (row) => {
    const [result] = await db.select({ value: count() }).from(exams).where(eq(exams.folderId, row.id)).limit(1);
    return { ...row, examCount: result?.value ?? 0 };
  }));
}

export async function GET() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  return Response.json({ folders: await listFolders() });
}

export async function POST(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = folderInput.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Thông tin thư mục chưa hợp lệ." }, { status: 400 });
  const id = crypto.randomUUID();
  const db = getDb();
  await db.insert(examFolders).values({ id, ...parsed.data, createdBy: auth.profile.userId });
  await db.insert(activityLog).values({ actorId: auth.profile.userId, action: `Tạo thư mục ${parsed.data.name}`, entityType: "exam_folder", entityId: id });
  return Response.json({ id, folders: await listFolders() }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = folderInput.extend({ id: z.string().uuid() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Thông tin thư mục chưa hợp lệ." }, { status: 400 });
  const { id, ...values } = parsed.data;
  await getDb().update(examFolders).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(examFolders.id, id));
  return Response.json({ folders: await listFolders() });
}

export async function DELETE(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Mã thư mục không hợp lệ." }, { status: 400 });
  const [usage] = await getDb().select({ value: count() }).from(exams).where(eq(exams.folderId, parsed.data.id)).limit(1);
  if ((usage?.value ?? 0) > 0) return Response.json({ error: "Thư mục còn chứa đề. Hãy chuyển hoặc xóa đề trước." }, { status: 409 });
  await getDb().delete(examFolders).where(eq(examFolders.id, parsed.data.id));
  return Response.json({ ok: true });
}
