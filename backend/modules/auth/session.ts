import { randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "@/database/client";
import { authSessions, profiles, users } from "@/database/schema";
import type { AuthUser } from "@/frontend/features/auth/model/auth.types";

export const SESSION_COOKIE = "hoalab_session";
const ISSUER = "hoalab";
const AUDIENCE = "hoalab-web";
const UUID = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const secure = process.env.NODE_ENV === "production";

export function sessionKey() {
  const key = process.env.HOALAB_SESSION_SECRET;
  if (key && Buffer.byteLength(key) >= 32) return new TextEncoder().encode(key);
  if (secure) throw new Error("HOALAB_SESSION_SECRET requires at least 32 bytes.");
  return new TextEncoder().encode("hoalab-development-only-session-key-do-not-deploy");
}

export function newSession(userId: string, rememberMe: boolean, passwordChangeRequired = false) {
  const seconds = passwordChangeRequired ? 900 : rememberMe ? 30 * 86400 : 12 * 3600;
  return { id: randomUUID(), userId, rememberMe, expiresAt: new Date(Date.now() + seconds * 1000).toISOString() };
}

export async function sessionCookie(session: ReturnType<typeof newSession>, restricted = false) {
  const expiry = Math.floor(Date.parse(session.expiresAt) / 1000);
  const jwt = await new SignJWT({}).setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER).setAudience(AUDIENCE).setIssuedAt().setSubject(session.userId)
    .setJti(session.id).setExpirationTime(expiry).sign(sessionKey());
  const persistent = session.rememberMe && !restricted ? `; Max-Age=${Math.max(0, expiry - Math.floor(Date.now() / 1000))}` : "";
  return `${SESSION_COOKIE}=${jwt}; Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}${persistent}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}

export async function getAuthentication() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let claims;
  try {
    ({ payload: claims } = await jwtVerify(token, sessionKey(), {
      algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE, typ: "JWT", requiredClaims: ["sub", "jti", "exp", "iat"],
    }));
  } catch {
    return null;
  }
  if (!claims.jti || !claims.sub || !UUID.test(claims.jti) || !UUID.test(claims.sub)) return null;

  const [record] = await getDb().select({ session: authSessions, account: users, profile: profiles })
    .from(authSessions).innerJoin(users, eq(users.id, authSessions.userId)).innerJoin(profiles, eq(profiles.userId, users.profileId))
    .where(and(eq(authSessions.id, claims.jti), eq(users.id, claims.sub), eq(users.status, "active"),
      gt(authSessions.expiresAt, new Date().toISOString()))).limit(1);
  if (!record) return null;
  if (record.account.mustChangePassword && record.account.temporaryPasswordExpiresAt &&
      Date.parse(record.account.temporaryPasswordExpiresAt) <= Date.now()) return null;
  return record;
}

export function sessionUser(account: typeof users.$inferSelect, profile: typeof profiles.$inferSelect): AuthUser {
  return {
    userId: profile.userId,
    email: profile.email,
    displayName: profile.fullName ?? account.loginId,
    fullName: profile.fullName,
    role: account.role === "admin" ? "admin" : "student",
    gradeLevel: profile.gradeLevel,
    mustChangePassword: account.mustChangePassword,
  };
}

export async function getSessionUser(options?: { allowPasswordChange: boolean }): Promise<AuthUser | null> {
  const auth = await getAuthentication();
  if (!auth || (auth.account.mustChangePassword && !options?.allowPasswordChange)) return null;
  return sessionUser(auth.account, auth.profile);
}
