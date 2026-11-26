import { z } from "zod";
import { ensureProfile } from "@/backend/modules/auth/profile.service";
import { createSessionToken, sessionCookie, verifyCredentials } from "@/backend/modules/auth/session";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export async function POST(request: Request) {
  const parsed = credentialsSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Email hoặc mật khẩu chưa hợp lệ." }, { status: 400 });
  const user = verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return Response.json({ error: "Sai email hoặc mật khẩu." }, { status: 401 });

  const profile = await ensureProfile(user);
  const token = await createSessionToken(profile);
  return Response.json({ user: profile }, { headers: { "Set-Cookie": sessionCookie(token) } });
}
