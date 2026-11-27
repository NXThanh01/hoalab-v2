import type { AIMode, AIMessage } from "@/frontend/features/ai/model/ai.types";
import { CHAT_MAX_MESSAGES } from "@/shared/chemistry-chat";

export async function askChemistryAI(messages: AIMessage[], mode: AIMode, signal: AbortSignal) {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      messages: messages.filter(({ id }) => id !== "welcome").slice(-CHAT_MAX_MESSAGES)
        .map(({ role, content }) => ({ role, content: content.slice(0, 8000) })),
    }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || typeof data?.answer !== "string" || data.model !== "gemini") {
    throw new Error(data?.error ?? "Chưa nhận được phản hồi. Hãy thử lại.");
  }
  return data as { answer: string; model: "gemini"; truncated: boolean };
}
