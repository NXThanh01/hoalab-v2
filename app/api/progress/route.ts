import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSessionUser } from "@/backend/modules/auth/session";
import { getDb } from "@/database/client";
import { learningProgress } from "@/database/schema";
import { ensureProfile } from "@/backend/modules/auth/profile.service";

export const dynamic = "force-dynamic";

const progressInput = z.object({
  lessonId: z.number().int().positive(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  bestScore: z.number().min(0).max(10),
  videoSecond: z.number().min(0).default(0),
  checkpoints: z.array(z.number().int().nonnegative()).default([]),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  await ensureProfile(user);
  const rows = await getDb().select().from(learningProgress).where(eq(learningProgress.userId, user.userId));
  return Response.json({
    progress: rows.map((row) => ({ ...row, checkpoints: JSON.parse(row.checkpointsJson) })),
    syncedAt: new Date().toISOString(),
  });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  await ensureProfile(user);

  const parsed = progressInput.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Dữ liệu tiến trình không hợp lệ." }, { status: 400 });
  const input = parsed.data;
  const db = getDb();
  const [current] = await db.select().from(learningProgress).where(and(
    eq(learningProgress.userId, user.userId),
    eq(learningProgress.lessonId, input.lessonId),
  )).limit(1);

  const values = {
    userId: user.userId,
    lessonId: input.lessonId,
    status: input.status,
    bestScore: Math.max(current?.bestScore ?? 0, input.bestScore),
    videoSecond: input.videoSecond,
    checkpointsJson: JSON.stringify(input.checkpoints),
    updatedAt: new Date().toISOString(),
  };

  await db.insert(learningProgress).values(values).onConflictDoUpdate({
    target: [learningProgress.userId, learningProgress.lessonId],
    set: values,
  });
  return Response.json({ progress: values, syncedAt: values.updatedAt });
}
