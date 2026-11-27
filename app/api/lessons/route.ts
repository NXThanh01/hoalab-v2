import { asc, eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { lessonContents } from "@/database/schema";
import { videoSourceForLesson } from "@/shared/lesson-video";
import { getSessionUser } from "@/backend/modules/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await getSessionUser()) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const rows = await getDb().select({
    id: lessonContents.id,
    gradeLevel: lessonContents.gradeLevel,
    lessonNumber: lessonContents.lessonNumber,
    title: lessonContents.title,
    videoUrl: lessonContents.videoUrl,
    checkpointsJson: lessonContents.checkpointsJson,
  }).from(lessonContents).where(eq(lessonContents.status, "published")).orderBy(asc(lessonContents.lessonNumber));
  return Response.json({ lessons: rows.map(({ checkpointsJson, ...row }) => ({
    ...row, videoUrl: videoSourceForLesson(row.videoUrl, row.id), checkpoints: JSON.parse(checkpointsJson),
  })) });
}
