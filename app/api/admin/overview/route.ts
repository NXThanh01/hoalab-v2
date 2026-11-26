import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { activityLog, examAttempts, exams, profiles, questionBank } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const db = getDb();
  const [studentRows, questionRows, examRows, attemptRows, recentActivity] = await Promise.all([
    db.select({ value: count() }).from(profiles).where(eq(profiles.role, "student")).limit(1),
    db.select({ value: count() }).from(questionBank).limit(1),
    db.select({ value: count() }).from(exams).limit(1),
    db.select({ score: examAttempts.score, answersJson: examAttempts.answersJson, passScore: exams.passScore })
      .from(examAttempts).innerJoin(exams, eq(examAttempts.examId, exams.id)),
    db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(8),
  ]);
  const studentRow = studentRows[0];
  const questionRow = questionRows[0];
  const examRow = examRows[0];
  const scoredAttempts = attemptRows.filter((item) => typeof item.score === "number");
  const averageScore = scoredAttempts.length ? scoredAttempts.reduce((sum, item) => sum + (item.score ?? 0), 0) / scoredAttempts.length : 0;
  const passRate = scoredAttempts.length ? (scoredAttempts.filter((item) => (item.score ?? 0) >= item.passScore).length / scoredAttempts.length) * 100 : 0;
  const integrityFlags = attemptRows.filter((item) => {
    try {
      const stored = JSON.parse(item.answersJson) as { integrity?: { tabSwitches?: number; fullscreenExits?: number } };
      return (stored.integrity?.tabSwitches ?? 0) + (stored.integrity?.fullscreenExits ?? 0) > 0;
    } catch { return false; }
  }).length;
  return Response.json({
    overview: {
      students: studentRow?.value ?? 0,
      questions: questionRow?.value ?? 0,
      exams: examRow?.value ?? 0,
      attempts: attemptRows.length,
      averageScore: Number(averageScore.toFixed(1)),
      passRate: Number(passRate.toFixed(1)),
      integrityFlags,
      recentActivity,
    },
    syncedAt: new Date().toISOString(),
  });
}
