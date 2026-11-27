import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/database/client";
import { activityLog, examFolders, examQuestions, exams, questionBank } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";
import { questionBatch } from "@/shared/question-input";

export const dynamic = "force-dynamic";

const examInput = z.object({
  title: z.string().trim().min(4).max(180),
  description: z.string().trim().max(2000).default(""),
  gradeLevel: z.number().int().min(10).max(12),
  folderId: z.string().uuid().nullable().optional(),
  kind: z.enum(["quiz", "exam"]).default("exam"),
  durationMinutes: z.number().int().min(5).max(180),
  passScore: z.number().min(0).max(10),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
  questionIds: z.array(z.string().uuid()).min(1).max(100),
});

async function listExams() {
  const db = getDb();
  const rows = await db.select().from(exams).orderBy(desc(exams.createdAt)).limit(100);
  return Promise.all(rows.map(async (row) => {
    const links = await db.select({ questionId: examQuestions.questionId }).from(examQuestions).where(eq(examQuestions.examId, row.id)).orderBy(asc(examQuestions.position));
    return { ...row, questionCount: links.length, questionIds: links.map((item) => item.questionId) };
  }));
}

async function replaceExamQuestions(examId: string, questionIds: string[]) {
  const db = getDb();
  await db.delete(examQuestions).where(eq(examQuestions.examId, examId));
  const weights = questionIds.length
    ? await db.select({ id: questionBank.id, points: questionBank.points }).from(questionBank).where(inArray(questionBank.id, questionIds))
    : [];
  const weightById = new Map(weights.map((item) => [item.id, item.points]));
  for (const [position, questionId] of questionIds.entries()) {
    await db.insert(examQuestions).values({ examId, questionId, position, points: weightById.get(questionId) ?? 1 });
  }
}

export async function GET() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  return Response.json({ exams: await listExams(), syncedAt: new Date().toISOString() });
}

export async function POST(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = z.union([
    examInput.omit({ questionIds: true }).extend({ importedQuestions: questionBatch, folderId: z.string().uuid() }),
    examInput,
  ]).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Thông tin kỳ thi chưa hợp lệ.", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const db = getDb();
  const id = crypto.randomUUID();
  if ("importedQuestions" in input) {
    const [folder] = await db.select({ id: examFolders.id }).from(examFolders)
      .where(and(eq(examFolders.id, input.folderId), eq(examFolders.gradeLevel, input.gradeLevel))).limit(1);
    if (!folder || input.importedQuestions.some((question) => question.gradeLevel !== input.gradeLevel)) {
      return Response.json({ error: "Thư mục và câu hỏi phải cùng khối lớp với đề." }, { status: 400 });
    }
    const questions = input.importedQuestions.map(({ options, ...question }) => ({
      ...question, id: crypto.randomUUID(), optionsJson: JSON.stringify(options), createdBy: auth.profile.userId,
    }));
    await db.transaction(async (tx) => {
      await tx.insert(questionBank).values(questions);
      await tx.insert(exams).values({
        id, title: input.title, description: input.description, gradeLevel: input.gradeLevel,
        folderId: input.folderId, kind: input.kind, durationMinutes: input.durationMinutes,
        passScore: input.passScore, startsAt: input.startsAt || null, endsAt: input.endsAt || null,
        createdBy: auth.profile.userId,
      });
      await tx.insert(examQuestions).values(questions.map((question, position) => ({
        examId: id, questionId: question.id, position, points: question.points,
      })));
      await tx.insert(activityLog).values({
        actorId: auth.profile.userId, action: `Tạo đề từ ${questions.length} câu nhập`, entityType: "exam", entityId: id,
      });
    });
    return Response.json({ id }, { status: 201 });
  }
  await db.insert(exams).values({
    id,
    title: input.title,
    description: input.description,
    gradeLevel: input.gradeLevel,
    folderId: input.folderId || null,
    kind: input.kind,
    durationMinutes: input.durationMinutes,
    passScore: input.passScore,
    startsAt: input.startsAt || null,
    endsAt: input.endsAt || null,
    createdBy: auth.profile.userId,
  });
  await replaceExamQuestions(id, input.questionIds);
  await db.insert(activityLog).values({
    actorId: auth.profile.userId,
    action: "Tạo kỳ thi",
    entityType: "exam",
    entityId: id,
  });
  return Response.json({ id, exams: await listExams() }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = z.union([
    examInput.extend({ id: z.string().uuid(), status: z.enum(["draft", "published", "archived"]).optional() }),
    z.object({ id: z.string().uuid(), status: z.enum(["draft", "published", "archived"]) }),
  ]).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Thông tin kỳ thi không hợp lệ." }, { status: 400 });
  const db = getDb();
  if ("title" in parsed.data) {
    await db.update(exams).set({
      title: parsed.data.title,
      description: parsed.data.description,
      gradeLevel: parsed.data.gradeLevel,
      folderId: parsed.data.folderId || null,
      kind: parsed.data.kind,
      durationMinutes: parsed.data.durationMinutes,
      passScore: parsed.data.passScore,
      startsAt: parsed.data.startsAt || null,
      endsAt: parsed.data.endsAt || null,
      status: parsed.data.status ?? "draft",
      updatedAt: new Date().toISOString(),
    }).where(eq(exams.id, parsed.data.id));
    await replaceExamQuestions(parsed.data.id, parsed.data.questionIds);
  } else {
    await db.update(exams).set({ status: parsed.data.status, updatedAt: new Date().toISOString() }).where(eq(exams.id, parsed.data.id));
  }
  await db.insert(activityLog).values({
    actorId: auth.profile.userId,
    action: parsed.data.status === "published" ? "Xuất bản kỳ thi" : "Cập nhật kỳ thi",
    entityType: "exam",
    entityId: parsed.data.id,
  });
  return Response.json({ exams: await listExams() });
}
