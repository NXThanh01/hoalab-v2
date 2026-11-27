import { asc, eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { lessonContents } from "@/database/schema";
import { videoSourceForLesson } from "@/shared/lesson-video";

export const dynamic = "force-dynamic";

export async function GET() {
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
