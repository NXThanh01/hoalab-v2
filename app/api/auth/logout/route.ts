import { eq } from "drizzle-orm";
import { clearSessionCookie, getAuthentication } from "@/backend/modules/auth/session";
import { authJson, sameOrigin } from "@/backend/modules/auth/auth-http";
import { authSessions } from "@/database/schema";
import { getDb } from "@/database/client";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJson({ error: "Yêu cầu không hợp lệ." }, 403);
  const auth = await getAuthentication();
  if (auth) await getDb().delete(authSessions).where(eq(authSessions.id, auth.session.id));
  return authJson({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
}
