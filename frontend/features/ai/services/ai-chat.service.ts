import type { AIMode, AIMessage } from "@/frontend/features/ai/model/ai.types";

export async function askChemistryAI(messages: AIMessage[], mode: AIMode) {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      messages: messages.slice(-8).map(({ role, content }) => ({ role, content })),
    }),
  });

  if (!response.ok) throw new Error("Trợ lý AI đang bận. Vui lòng thử lại.");
  return response.json() as Promise<{ answer: string; model: "openai" | "mock" }>;
}
