import { headers } from "next/headers";
import type { AuthUser, UserRole } from "@/frontend/features/auth/model/auth.types";

export const SESSION_COOKIE = "hoalab_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = AuthUser & { exp: number };

type Account = {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  gradeLevel: number;
};

function getAccounts(): Account[] {
  const configured = [
    process.env.HOALAB_ADMIN_EMAIL && process.env.HOALAB_ADMIN_PASSWORD ? {
      email: process.env.HOALAB_ADMIN_EMAIL,
      password: process.env.HOALAB_ADMIN_PASSWORD,
      fullName: process.env.HOALAB_ADMIN_NAME ?? "Quản trị viên HóaLab",
      role: "admin" as const,
      gradeLevel: 0,
    } : null,
    process.env.HOALAB_STUDENT_EMAIL && process.env.HOALAB_STUDENT_PASSWORD ? {
      email: process.env.HOALAB_STUDENT_EMAIL,
      password: process.env.HOALAB_STUDENT_PASSWORD,
      fullName: process.env.HOALAB_STUDENT_NAME ?? "Nguyễn Minh Anh",
      role: "student" as const,
      gradeLevel: Number(process.env.HOALAB_STUDENT_GRADE ?? 12),
    } : null,
  ].filter((account): account is Account => Boolean(account));

  if (configured.length) return configured;
  if (process.env.NODE_ENV === "production") return [];

  return [
    { email: "admin@hoalab.local", password: "Admin@123", fullName: "Quản trị viên HóaLab", role: "admin", gradeLevel: 0 },
    { email: "student@hoalab.local", password: "Student@123", fullName: "Nguyễn Minh Anh", role: "student", gradeLevel: 12 },
  ];
}

function secret() {
  const value = process.env.HOALAB_SESSION_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "hoalab-local-development-secret-change-before-deploy";
  throw new Error("HOALAB_SESSION_SECRET is required in production.");
}

function encode(value: string) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return decodeURIComponent(escape(atob(padded)));
}

async function signature(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signed)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

export async function createSessionToken(user: AuthUser) {
  const payload = encode(JSON.stringify({ ...user, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS } satisfies SessionPayload));
  return `${payload}.${await signature(payload)}`;
}

export async function readSessionToken(token: string): Promise<AuthUser | null> {
  const [payload, signed] = token.split(".");
  if (!payload || !signed || !safeEqual(signed, await signature(payload))) return null;
  try {
    const parsed = JSON.parse(decode(payload)) as SessionPayload;
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      userId: parsed.userId,
      email: parsed.email,
      displayName: parsed.displayName,
      fullName: parsed.fullName,
      role: parsed.role,
      gradeLevel: parsed.gradeLevel,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  return token ? readSessionToken(token) : null;
}

export function verifyCredentials(email: string, password: string): AuthUser | null {
  const normalized = email.trim().toLowerCase();
  const account = getAccounts().find((item) => item.email.toLowerCase() === normalized && item.password === password);
  if (!account) return null;
  return {
    userId: `local:${account.role}:${account.email.toLowerCase()}`,
    email: account.email,
    displayName: account.fullName,
    fullName: account.fullName,
    role: account.role,
    gradeLevel: account.gradeLevel,
  };
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
