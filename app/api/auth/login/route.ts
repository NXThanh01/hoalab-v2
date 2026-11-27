import { and, eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { authSessions, profiles, users } from "@/database/schema";
import { loginInput } from "@/shared/auth-input";
import { authJson, fieldErrors, sameOrigin } from "@/backend/modules/auth/auth-http";
import { clearLoginAttempts, reserveLoginAttempt } from "@/backend/modules/auth/login-limit";
import { verifyLoginPassword } from "@/backend/modules/auth/password";
import { newSession, sessionCookie, sessionUser } from "@/backend/modules/auth/session";

const invalidCredentials = () => authJson({ error: "ID đăng nhập hoặc mật khẩu chưa đúng." }, 401);

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJson({ error: "Yêu cầu không hợp lệ." }, 403);
  const body = await request.json().catch(() => null);
  const parsed = loginInput.safeParse({ ...body, loginId: body?.loginId ?? body?.email });
  if (!parsed.success) return authJson({ fields: fieldErrors(parsed.error) }, 400);
  const { loginId, password, rememberMe } = parsed.data;
  const retryAfter = await reserveLoginAttempt(request, loginId);
  if (retryAfter) return authJson({ error: "Bạn đã thử quá nhiều lần. Hãy thử lại sau." }, 429, { "Retry-After": String(retryAfter) });

  const db = getDb();
  const [record] = await db.select({ account: users, profile: profiles }).from(users)
    .innerJoin(profiles, eq(profiles.userId, users.profileId)).where(eq(users.loginId, loginId)).limit(1);
  const correct = await verifyLoginPassword(record?.account.passwordHash, password);
  if (!record || !correct || record.account.status !== "active") return invalidCredentials();
  const account = record.account;
  if (account.mustChangePassword && account.temporaryPasswordExpiresAt && Date.parse(account.temporaryPasswordExpiresAt) <= Date.now()) {
    return authJson({ error: "Mật khẩu tạm đã hết hạn. Hãy liên hệ quản trị viên để nhận mật khẩu mới." }, 401);
  }

  const session = newSession(account.id, rememberMe, account.mustChangePassword);
  const cookie = await sessionCookie(session, account.mustChangePassword);
  const saved = await db.transaction(async (tx) => {
    const [current] = await tx.update(users).set({ lastLoginAt: new Date().toISOString() })
      .where(and(eq(users.id, account.id), eq(users.passwordHash, account.passwordHash), eq(users.status, "active"))).returning();
    if (!current) return null;
    await tx.insert(authSessions).values(session);
    return current;
  });
  if (!saved) return invalidCredentials();
  await clearLoginAttempts(loginId);
  return authJson({ user: sessionUser(saved, record.profile) }, 200, { "Set-Cookie": cookie });
}
