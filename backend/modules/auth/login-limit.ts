import { createHmac, randomInt } from "node:crypto";
import { eq, lt, sql } from "drizzle-orm";
import { getDb } from "@/database/client";
import { authSessions, loginLimits } from "@/database/schema";
import { sessionKey } from "./session";

const minutes = 15;
const digest = (value: string) => createHmac("sha256", sessionKey()).update(value).digest("hex");
const accountKey = (loginId: string) => digest(`account:${loginId}`);

export async function reserveLoginAttempt(request: Request, loginId: string) {
  const ip = process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : null;
  const keys = [accountKey(loginId), digest(`ip:${ip || "shared"}`)];
  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutes * 60_000).toISOString();
  const db = getDb();
  const rows = await db.insert(loginLimits).values(
    [...keys].sort().map((key) => ({ key, attempts: 1, expiresAt })),
  ).onConflictDoUpdate({
    target: loginLimits.key,
    set: {
      attempts: sql`case when ${loginLimits.expiresAt} <= now() then 1 else least(${loginLimits.attempts} + 1, 1000) end`,
      expiresAt: sql`case when ${loginLimits.expiresAt} <= now() then excluded.expires_at else ${loginLimits.expiresAt} end`,
    },
  }).returning();
  if (randomInt(100) === 0) {
    await db.transaction(async (tx) => {
      await tx.delete(loginLimits).where(lt(loginLimits.expiresAt, now.toISOString()));
      await tx.delete(authSessions).where(lt(authSessions.expiresAt, now.toISOString()));
    });
  }
  return rows.reduce((wait, row) => row.attempts > (row.key === keys[0] ? 5 : 60)
    ? Math.max(wait, Math.ceil((Date.parse(row.expiresAt) - now.getTime()) / 1000)) : wait, 0);
}

export async function clearLoginAttempts(loginId: string) {
  await getDb().delete(loginLimits).where(eq(loginLimits.key, accountKey(loginId)));
}
