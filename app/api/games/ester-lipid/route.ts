import { z } from "zod";
import { authJson } from "@/backend/modules/auth/auth-http";
import { getSessionUser } from "@/backend/modules/auth/session";
import { checkEsterGameAnswer, loadEsterGameBank, splitEsterGameQuestion } from "@/backend/modules/games/ester-games";
import { esterGameModes, type EsterGameReview } from "@/shared/ester-games";

const answerSchema = z.object({ questionId: z.string().uuid(), answer: z.string().max(4000) });

export async function GET() {
  if (!await getSessionUser()) return authJson({ error: "Hãy đăng nhập để chơi." }, 401);
  const pools = { speed: [], verdict: [], calculation: [], equation: [] } as Record<
    (typeof esterGameModes)[number],
    NonNullable<ReturnType<typeof splitEsterGameQuestion>>["question"][]
  >;
  for (const row of await loadEsterGameBank()) {
    const item = splitEsterGameQuestion(row);
    if (item) pools[item.mode].push(item.question);
  }
  return authJson({ pools });
}

export async function POST(request: Request) {
  if (!await getSessionUser()) return authJson({ error: "Hãy đăng nhập lại để tiếp tục." }, 401);
  const input = answerSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return authJson({ error: "Câu trả lời không hợp lệ." }, 400);
  const [row] = await loadEsterGameBank(input.data.questionId);
  const item = row && splitEsterGameQuestion(row);
  if (!item) return authJson({ error: "Câu hỏi này không còn trong bộ ôn." }, 404);
  return authJson({
    correct: checkEsterGameAnswer(item.mode, input.data.answer, row.correctAnswer),
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
  } satisfies EsterGameReview);
}
