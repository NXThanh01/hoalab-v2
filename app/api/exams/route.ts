import { asc, eq } from "drizzle-orm";
import { getSessionUser } from "@/backend/modules/auth/session";
import { getDb } from "@/database/client";
import { examFolders, examQuestions, exams, questionBank } from "@/database/schema";
import { ensureProfile } from "@/backend/modules/auth/profile.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ exams: [], requiresAuth: true });
  await ensureProfile(user);
  const db = getDb();
  const published = await db.select().from(exams).where(eq(exams.status, "published"));
  const data = await Promise.all(published.map(async (exam) => {
    const [folder] = exam.folderId ? await db.select({ name: examFolders.name }).from(examFolders).where(eq(examFolders.id, exam.folderId)).limit(1) : [];
    const rows = await db.select({
      position: examQuestions.position,
      id: questionBank.id,
      type: questionBank.type,
      prompt: questionBank.prompt,
      optionsJson: questionBank.optionsJson,
      points: examQuestions.points,
    }).from(examQuestions).innerJoin(questionBank, eq(examQuestions.questionId, questionBank.id)).where(eq(examQuestions.examId, exam.id)).orderBy(asc(examQuestions.position));
    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      gradeLevel: exam.gradeLevel,
      durationMinutes: exam.durationMinutes,
      passScore: exam.passScore,
      folderId: exam.folderId,
      folderName: folder?.name ?? "Chưa phân loại",
      kind: exam.kind,
      questions: rows.map((row) => ({ ...row, options: JSON.parse(row.optionsJson) as string[], optionsJson: undefined })),
    };
  }));
  return Response.json({ exams: data, syncedAt: new Date().toISOString() });
}
