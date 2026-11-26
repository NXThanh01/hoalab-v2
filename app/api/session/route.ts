import { getSessionUser } from "@/backend/modules/auth/session";
import { ensureProfile } from "@/backend/modules/auth/profile.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ user: null }, { status: 401 });

  try {
    const profile = await ensureProfile(user);
    return Response.json({ user: profile });
  } catch (error) {
    console.error("session bootstrap failed", error);
    return Response.json({ error: "Không thể tải hồ sơ người dùng." }, { status: 500 });
  }
}
