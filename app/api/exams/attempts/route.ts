import { asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionUser } from "@/backend/modules/auth/session";
import { getDb } from "@/database/client";
import { examAttempts, examQuestions, exams, questionBank } from "@/database/schema";
import { ensureProfile } from "@/backend/modules/auth/profile.service";

export const dynamic = "force-dynamic";

const inputSchema = z.object({
  examId: z.string().uuid(),
  answers: z.record(z.string(), z.string().max(4000)),
  integrity: z.object({
    tabSwitches: z.number().int().min(0).max(100),
    fullscreenExits: z.number().int().min(0).max(100),
    elapsedSeconds: z.number().int().min(0).max(24 * 60 * 60),
    fullscreenUsed: z.boolean(),
  }).optional(),
});

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "").replace(/[⇌↔]/g, "<->").replace(/[→=]/g, "->");
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ attempts: [], requiresAuth: true });
  await ensureProfile(user);
  const rows = await getDb().select({
    id: examAttempts.id,
    examId: examAttempts.examId,
    examTitle: exams.title,
    score: examAttempts.score,
    passScore: exams.passScore,
    submittedAt: examAttempts.submittedAt,
  }).from(examAttempts).innerJoin(exams, eq(examAttempts.examId, exams.id))
    .where(eq(examAttempts.userId, user.userId)).orderBy(desc(examAttempts.submittedAt)).limit(20);
  return Response.json({ attempts: rows.map((item) => ({ ...item, passed: (item.score ?? 0) >= item.passScore })) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  await ensureProfile(user);
  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Bài làm không hợp lệ." }, { status: 400 });
  const db = getDb();
  const [exam] = await db.select().from(exams).where(eq(exams.id, parsed.data.examId)).limit(1);
  if (!exam || exam.status !== "published") return Response.json({ error: "Kỳ thi không còn mở." }, { status: 404 });
  const rows = await db.select({
    position: examQuestions.position,
    questionId: questionBank.id,
    type: questionBank.type,
    prompt: questionBank.prompt,
    optionsJson: questionBank.optionsJson,
    correctAnswer: questionBank.correctAnswer,
    explanation: questionBank.explanation,
    points: examQuestions.points,
  }).from(examQuestions).innerJoin(questionBank, eq(examQuestions.questionId, questionBank.id)).where(eq(examQuestions.examId, exam.id)).orderBy(asc(examQuestions.position));
  const total = rows.reduce((sum, item) => sum + item.points, 0) || 1;
  const earned = rows.reduce((sum, item) => sum + (normalize(parsed.data.answers[item.questionId] ?? "") === normalize(item.correctAnswer) ? item.points : 0), 0);
  const score = Number(((earned / total) * 10).toFixed(2));
  const id = crypto.randomUUID();
  await db.insert(examAttempts).values({
    id,
    examId: exam.id,
    userId: user.userId,
    score,
    status: "graded",
    answersJson: JSON.stringify({ answers: parsed.data.answers, integrity: parsed.data.integrity }),
    submittedAt: new Date().toISOString(),
  });
  return Response.json({
    attemptId: id,
    score,
    passed: score >= exam.passScore,
    correct: rows.filter((item) => normalize(parsed.data.answers[item.questionId] ?? "") === normalize(item.correctAnswer)).length,
    total: rows.length,
    integrity: parsed.data.integrity ?? { tabSwitches: 0, fullscreenExits: 0, elapsedSeconds: 0, fullscreenUsed: false },
    review: rows.map((item) => {
      const answer = parsed.data.answers[item.questionId] ?? "";
      const correct = normalize(answer) === normalize(item.correctAnswer);
      return {
        questionId: item.questionId,
        type: item.type,
        prompt: item.prompt,
        options: JSON.parse(item.optionsJson) as string[],
        answer,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        correct,
        earnedPoints: correct ? item.points : 0,
        maxPoints: item.points,
      };
    }),
  });
}
