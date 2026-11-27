import { randomBytes } from "node:crypto";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";
import { authJson, sameOrigin } from "@/backend/modules/auth/auth-http";
import { clearLoginAttempts } from "@/backend/modules/auth/login-limit";
import { hashPassword } from "@/backend/modules/auth/password";
import { getDb } from "@/database/client";
import { activityLog, authSessions, users } from "@/database/schema";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return authJson({ error: "Yêu cầu không hợp lệ." }, 403);
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return authJson({ error: "ID tài khoản không hợp lệ." }, 400);
  const db = getDb();
  const [target] = await db.select({ profileId: users.profileId, status: users.status, passwordHash: users.passwordHash })
    .from(users).where(eq(users.id, parsed.data.id)).limit(1);
  if (!target) return authJson({ error: "Không tìm thấy tài khoản." }, 404);
  if (target.profileId === auth.user.userId) return authJson({ error: "Dùng mục Đổi mật khẩu cho tài khoản của bạn." }, 400);
  if (target.status !== "active") return authJson({ error: "Tài khoản đang bị tạm khóa." }, 409);

  const temporaryPassword = randomBytes(18).toString("base64url");
  const passwordHash = await hashPassword(temporaryPassword);
  const expiresAt = new Date(Date.now() + 24 * 3600_000).toISOString();
  const account = await db.transaction(async (tx) => {
    const [row] = await tx.update(users).set({ passwordHash, mustChangePassword: true, temporaryPasswordExpiresAt: expiresAt })
      .where(and(eq(users.id, parsed.data.id), eq(users.status, "active"), ne(users.profileId, auth.user.userId), eq(users.passwordHash, target.passwordHash)))
      .returning({ id: users.id, loginId: users.loginId });
    if (!row) return null;
    await tx.delete(authSessions).where(eq(authSessions.userId, row.id));
    await tx.insert(activityLog).values({
      actorId: auth.user.userId, action: "Đặt lại mật khẩu", entityType: "user", entityId: row.id,
    });
    return row;
  });
  if (!account) return authJson({ error: "Tài khoản đã thay đổi. Hãy tải lại danh sách." }, 409);
  await clearLoginAttempts(account.loginId);
  return authJson({ loginId: account.loginId, temporaryPassword, expiresAt });
}
