import { and, eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { authSessions, users } from "@/database/schema";
import { changePasswordInput } from "@/shared/auth-input";
import { authJson, fieldErrors, sameOrigin } from "@/backend/modules/auth/auth-http";
import { clearLoginAttempts, reserveLoginAttempt } from "@/backend/modules/auth/login-limit";
import { hashPassword, verifyPassword } from "@/backend/modules/auth/password";
import { getAuthentication, newSession, sessionCookie, sessionUser } from "@/backend/modules/auth/session";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJson({ error: "Yêu cầu không hợp lệ." }, 403);
  const auth = await getAuthentication();
  if (!auth) return authJson({ error: "Phiên đã hết hạn. Hãy đăng nhập lại." }, 401);
  const input = changePasswordInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return authJson({ fields: fieldErrors(input.error) }, 400);
  const rateKey = `change:${auth.account.id}`;
  const retryAfter = await reserveLoginAttempt(request, rateKey);
  if (retryAfter) return authJson({ error: "Bạn đã thử quá nhiều lần. Hãy thử lại sau." }, 429, { "Retry-After": String(retryAfter) });
  if (!await verifyPassword(auth.account.passwordHash, input.data.currentPassword)) {
    return authJson({ fields: { currentPassword: "Mật khẩu hiện tại chưa đúng." } }, 400);
  }
  const passwordHash = await hashPassword(input.data.newPassword);
  const session = newSession(auth.account.id, auth.session.rememberMe);
  const cookie = await sessionCookie(session);
  const staleSession = new Error("STALE_SESSION");
  const account = await getDb().transaction(async (tx) => {
    const [updated] = await tx.update(users).set({ passwordHash, mustChangePassword: false, temporaryPasswordExpiresAt: null })
      .where(and(eq(users.id, auth.account.id), eq(users.status, "active"), eq(users.passwordHash, auth.account.passwordHash))).returning();
    if (!updated) return null;
    const [current] = await tx.delete(authSessions).where(eq(authSessions.id, auth.session.id)).returning({ id: authSessions.id });
    if (!current) throw staleSession;
    await tx.delete(authSessions).where(eq(authSessions.userId, updated.id));
    await tx.insert(authSessions).values(session);
    return updated;
  }).catch((error) => {
    if (error === staleSession) return null;
    throw error;
  });
  if (!account) return authJson({ error: "Phiên đã thay đổi. Hãy đăng nhập lại." }, 409);
  await clearLoginAttempts(rateKey);
  return authJson({ user: sessionUser(account, auth.profile) }, 200, { "Set-Cookie": cookie });
}
