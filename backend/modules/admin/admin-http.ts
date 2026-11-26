import { getSessionUser } from "@/backend/modules/auth/session";
import { requireAdmin } from "@/backend/modules/auth/profile.service";

export async function getAdminOrResponse() {
  const user = await getSessionUser();
  if (!user) return { response: Response.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  try {
    const profile = await requireAdmin(user);
    return { user, profile };
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { response: Response.json({ error: "FORBIDDEN" }, { status: 403 }) };
    }
    throw error;
  }
}
