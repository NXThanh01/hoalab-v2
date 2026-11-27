import { issueSignedToken, presignUrl } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/backend/modules/auth/session";
import { getDb } from "@/database/client";
import { lessonContents } from "@/database/schema";
import { getVideoBlobPath } from "@/shared/lesson-video";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return new Response(null, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || id.length > 100) return new Response(null, { status: 400 });
  const [lesson] = await getDb().select({ status: lessonContents.status, videoUrl: lessonContents.videoUrl })
    .from(lessonContents).where(eq(lessonContents.id, id)).limit(1);
  if (!lesson || (lesson.status !== "published" && user.role !== "admin")) return new Response(null, { status: 404 });
  const pathname = getVideoBlobPath(lesson.videoUrl);
  if (!pathname) return new Response(null, { status: 404 });
  try {
    const validUntil = Date.now() + 2 * 60 * 60 * 1000;
    const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
    const { presignedUrl } = await presignUrl(token, { pathname, operation: "get", access: "private", validUntil });
    return new Response(null, { status: 307, headers: { Location: presignedUrl, "Cache-Control": "private, no-store" } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
