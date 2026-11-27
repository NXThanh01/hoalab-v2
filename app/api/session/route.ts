import { getSessionUser } from "@/backend/modules/auth/session";
import { authJson } from "@/backend/modules/auth/auth-http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser({ allowPasswordChange: true });
  return authJson({ user }, user ? 200 : 401);
}
