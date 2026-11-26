import { eq } from "drizzle-orm";
import { getDb } from "@/database/client";
import { profiles } from "@/database/schema";
import type { AuthUser } from "@/frontend/features/auth/model/auth.types";

export async function ensureProfile(user: AuthUser) {
  const db = getDb();
  const [existing] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);

  if (!existing) {
    await db.insert(profiles).values({
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      gradeLevel: user.gradeLevel,
    }).onConflictDoNothing();
  } else if (existing.email !== user.email || existing.fullName !== user.fullName || existing.role !== user.role || existing.gradeLevel !== user.gradeLevel) {
    await db.update(profiles).set({
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      gradeLevel: user.gradeLevel,
      updatedAt: new Date().toISOString(),
    }).where(eq(profiles.userId, user.userId));
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.userId)).limit(1);
  if (!profile) throw new Error("Không thể khởi tạo hồ sơ người dùng.");

  return {
    userId: profile.userId,
    email: profile.email,
    fullName: profile.fullName,
    displayName: profile.fullName ?? profile.email.split("@")[0],
    role: profile.role,
    gradeLevel: profile.gradeLevel,
  };
}

export async function requireAdmin(user: AuthUser) {
  const profile = await ensureProfile(user);
  if (profile.role !== "admin") throw new Error("FORBIDDEN");
  return profile;
}
