import { z } from "zod";

export const CHAT_MAX_QUESTION = 3000;
export const CHAT_MAX_MESSAGES = 8;
const chatMode = z.enum(["explain", "solve", "balance", "quiz"]);

export const chemistryChatInput = z.object({
  mode: chatMode.default("explain"),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(8000),
  })).min(1).max(CHAT_MAX_MESSAGES),
}).refine(({ messages }) => messages.at(-1)?.role === "user" &&
  messages.every(({ role, content }) => role !== "user" || content.length <= CHAT_MAX_QUESTION));

export type ChemistryChatInput = z.infer<typeof chemistryChatInput>;
