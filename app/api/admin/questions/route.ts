import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/database/client";
import { activityLog, examQuestions, questionBank } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";

export const dynamic = "force-dynamic";

const questionInput = z.object({
  type: z.enum(["multiple_choice", "essay", "equation"]),
  subject: z.string().trim().min(2).max(120),
  gradeLevel: z.number().int().min(10).max(12),
  prompt: z.string().trim().min(5).max(4000),
  options: z.array(z.string().trim().min(1)).max(6).default([]),
  correctAnswer: z.string().trim().max(2000).default(""),
  explanation: z.string().trim().max(4000).default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  points: z.number().positive().max(10).default(1),
});

const bodyInput = z.union([questionInput, z.object({ questions: z.array(questionInput).min(1).max(100) })]);

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
  const parsed = bodyInput.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Nội dung câu hỏi chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const inputs = "questions" in parsed.data ? parsed.data.questions : [parsed.data];
  const db = getDb();
  const created = [];
  for (const input of inputs) {
    const id = crypto.randomUUID();
    const record = {
      id,
      type: input.type,
      subject: input.subject,
      gradeLevel: input.gradeLevel,
      prompt: input.prompt,
      optionsJson: JSON.stringify(input.options),
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
      difficulty: input.difficulty,
      points: input.points,
      createdBy: auth.profile.userId,
    };
    await db.insert(questionBank).values(record);
    created.push({ ...record, options: input.options, createdAt: new Date().toISOString() });
  }
  await db.insert(activityLog).values({
    actorId: auth.profile.userId,
    action: inputs.length > 1 ? `Nhập ${inputs.length} câu hỏi` : "Tạo câu hỏi",
    entityType: "question",
    entityId: created[0].id,
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
