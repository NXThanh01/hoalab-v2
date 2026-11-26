import { clearSessionCookie } from "@/backend/modules/auth/session";

export async function POST() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
