import { desc, eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { examAttempts, exams, profiles } from "@/database/schema";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";

export const dynamic = "force-dynamic";

type StoredAttempt = {
  answers?: Record<string, string>;
  integrity?: { tabSwitches?: number; fullscreenExits?: number; elapsedSeconds?: number };
};

export async function GET() {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const rows = await getDb().select({
    id: examAttempts.id,
    examId: examAttempts.examId,
    examTitle: exams.title,
    studentName: profiles.fullName,
    studentEmail: profiles.email,
    score: examAttempts.score,
    answersJson: examAttempts.answersJson,
    submittedAt: examAttempts.submittedAt,
    passScore: exams.passScore,
  }).from(examAttempts)
    .innerJoin(exams, eq(examAttempts.examId, exams.id))
    .innerJoin(profiles, eq(examAttempts.userId, profiles.userId))
    .orderBy(desc(examAttempts.submittedAt))
    .limit(200);

  const attempts = rows.map((row) => {
    let integrity: StoredAttempt["integrity"] = {};
    try {
      const stored = JSON.parse(row.answersJson) as StoredAttempt;
      integrity = stored.integrity ?? {};
    } catch { /* Keep backward-compatible defaults. */ }
    return {
      id: row.id,
      examId: row.examId,
      examTitle: row.examTitle,
      studentName: row.studentName ?? "Học sinh",
      studentEmail: row.studentEmail,
      score: row.score ?? 0,
      passed: (row.score ?? 0) >= row.passScore,
      tabSwitches: integrity?.tabSwitches ?? 0,
      fullscreenExits: integrity?.fullscreenExits ?? 0,
      elapsedSeconds: integrity?.elapsedSeconds ?? 0,
      submittedAt: row.submittedAt,
    };
  });
  return Response.json({ attempts, syncedAt: new Date().toISOString() });
}
