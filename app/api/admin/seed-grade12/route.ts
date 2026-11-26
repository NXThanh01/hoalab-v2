import { eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { activityLog, examFolders, examQuestions, exams, questionBank } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";
import { grade12Exams, grade12Questions } from "@/frontend/features/admin/data/grade12-seed.data";

export async function POST() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const db = getDb();
  const folderSeeds = [
    { id: "12000000-0000-4000-8000-000000000001", name: "Ôn tập theo chương", description: "Quiz ngắn củng cố kiến thức từng chương", color: "sky" },
    { id: "12000000-0000-4000-8000-000000000002", name: "Thi thử tổng hợp", description: "Đề thi thử có thời gian và giám sát phiên thi", color: "indigo" },
  ];
  for (const folder of folderSeeds) {
    await db.insert(examFolders).values({ ...folder, gradeLevel: 12, createdBy: auth.profile.userId }).onConflictDoUpdate({ target: examFolders.id, set: { name: folder.name, description: folder.description, color: folder.color, updatedAt: new Date().toISOString() } });
  }

  for (const item of grade12Questions) {
    const record = {
      id: item.id,
      type: item.type,
      subject: item.subject,
      gradeLevel: item.gradeLevel,
      prompt: item.prompt,
      optionsJson: JSON.stringify(item.options),
      correctAnswer: item.correctAnswer,
      explanation: item.explanation,
      difficulty: item.difficulty,
      points: item.points,
      createdBy: auth.profile.userId,
      updatedAt: new Date().toISOString(),
    };
    await db.insert(questionBank).values(record).onConflictDoUpdate({ target: questionBank.id, set: record });
  }

  for (const [examIndex, item] of grade12Exams.entries()) {
    const folderId = examIndex === grade12Exams.length - 1 ? folderSeeds[1].id : folderSeeds[0].id;
    const kind = examIndex === grade12Exams.length - 1 ? "exam" as const : "quiz" as const;
    await db.insert(exams).values({
      id: item.id,
      title: item.title,
      description: item.description,
      gradeLevel: item.gradeLevel,
      folderId,
      kind,
      durationMinutes: item.durationMinutes,
      passScore: item.passScore,
      status: item.status,
      createdBy: auth.profile.userId,
      updatedAt: new Date().toISOString(),
    }).onConflictDoUpdate({
      target: exams.id,
      set: { title: item.title, description: item.description, folderId, kind, durationMinutes: item.durationMinutes, passScore: item.passScore, status: item.status, updatedAt: new Date().toISOString() },
    });
    await db.delete(examQuestions).where(eq(examQuestions.examId, item.id));
    for (const [position, questionId] of item.questionIds.entries()) {
      const question = grade12Questions.find((entry) => entry.id === questionId);
      await db.insert(examQuestions).values({ examId: item.id, questionId, position, points: question?.points ?? 1 });
    }
  }

  await db.insert(activityLog).values({ actorId: auth.profile.userId, action: "Nạp bộ demo Hóa học 12", entityType: "seed", entityId: "grade12-demo-v1" });
  return Response.json({ ok: true, questions: grade12Questions.length, exams: grade12Exams.length });
}
