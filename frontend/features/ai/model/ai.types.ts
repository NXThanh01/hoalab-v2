export type AIMode = "explain" | "solve" | "balance" | "quiz";

export type AIMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: number;
};
