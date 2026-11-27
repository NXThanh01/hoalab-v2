import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/database/client";
import { activityLog, examQuestions, questionBank } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";
import { questionBatch, questionInput } from "@/shared/question-input";

export const dynamic = "force-dynamic";

function serialize(row: typeof questionBank.$inferSelect) {
  return { ...row, options: JSON.parse(row.optionsJson) as string[] };
}

export async function GET() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const rows = await getDb().select().from(questionBank).orderBy(desc(questionBank.createdAt)).limit(200);
  return Response.json({ questions: rows.map(serialize), syncedAt: new Date().toISOString() });
}

export async function POST(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const body: unknown = await request.json().catch(() => null);
  const bulk = body !== null && typeof body === "object" && "questions" in body;
  const parsed = (bulk ? questionBatch : questionInput).safeParse(bulk ? body.questions : body);
  if (!parsed.success) return Response.json({ error: "Nội dung câu hỏi chưa hợp lệ.", issues: parsed.error.issues }, { status: 400 });
  const inputs = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
  const db = getDb();
  const records = inputs.map(({ options, ...question }) => ({
      ...question,
      id: crypto.randomUUID(),
      optionsJson: JSON.stringify(options),
      createdBy: auth.profile.userId,
  }));
  const created = await db.transaction(async (tx) => {
    const rows = await tx.insert(questionBank).values(records).returning();
    await tx.insert(activityLog).values({
      actorId: auth.profile.userId,
      action: bulk ? `Nhập ${inputs.length} câu hỏi` : "Tạo câu hỏi",
      entityType: "question",
      entityId: records[0].id,
    });
    return rows.map(serialize);
  });
  return Response.json({ questions: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = questionInput.extend({ id: z.string().uuid() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Nội dung câu hỏi chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const { id, ...input } = parsed.data;
  const { options, ...question } = input;
  const db = getDb();
  await db.update(questionBank).set({
    ...question,
    optionsJson: JSON.stringify(options),
    updatedAt: new Date().toISOString(),
  }).where(eq(questionBank.id, id));
  await db.insert(activityLog).values({ actorId: auth.profile.userId, action: "Cập nhật câu hỏi", entityType: "question", entityId: id });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Mã câu hỏi không hợp lệ." }, { status: 400 });
  const db = getDb();
  const [usage] = await db.select({ value: count() }).from(examQuestions).where(eq(examQuestions.questionId, parsed.data.id)).limit(1);
  if ((usage?.value ?? 0) > 0) return Response.json({ error: "Câu hỏi đang được dùng trong kỳ thi. Hãy gỡ khỏi kỳ thi trước khi xóa." }, { status: 409 });
  await db.delete(questionBank).where(eq(questionBank.id, parsed.data.id));
  await db.insert(activityLog).values({ actorId: auth.profile.userId, action: "Xóa câu hỏi", entityType: "question", entityId: parsed.data.id });
  return Response.json({ ok: true });
}
