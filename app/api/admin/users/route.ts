import { and, asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getAdminOrResponse } from "@/backend/modules/admin/admin-http";
import { authJson } from "@/backend/modules/auth/auth-http";
import { getDb } from "@/database/client";
import { users } from "@/database/schema";

const filters = z.object({
  q: z.string().trim().toLowerCase().max(150).default(""),
  status: z.enum(["all", "active", "suspended"]).default("all"),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});
const pageSize = 25;

export async function GET(request: Request) {
  const auth = await getAdminOrResponse();
  if ("response" in auth) return auth.response;
  const parsed = filters.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return authJson({ error: "Bộ lọc không hợp lệ." }, 400);
  const { q, status, page } = parsed.data;
  const rows = await getDb().select({
    id: users.id, loginId: users.loginId, role: users.role, status: users.status,
    lastLoginAt: users.lastLoginAt, mustChangePassword: users.mustChangePassword,
    isSelf: sql<boolean>`${users.profileId} = ${auth.user.userId}`,
  }).from(users).where(and(
    status === "all" ? undefined : eq(users.status, status),
    q ? sql`strpos(${users.loginId}, ${q}) > 0` : undefined,
  )).orderBy(asc(users.loginId)).limit(pageSize + 1).offset((page - 1) * pageSize);
  return authJson({ users: rows.slice(0, pageSize), hasNext: rows.length > pageSize });
}
