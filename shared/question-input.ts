import { z } from "zod";

export const questionInput = z.object({
  type: z.enum(["multiple_choice", "essay", "equation"]),
  subject: z.string().trim().min(2).max(120),
  gradeLevel: z.number().int().min(10).max(12),
  prompt: z.string().trim().min(5).max(4000),
  options: z.array(z.string().trim().min(1).max(2000)).max(6).default([]),
  correctAnswer: z.string().trim().max(2000).default(""),
  explanation: z.string().trim().max(4000).default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  points: z.number().positive().max(10).default(1),
});

export function checkQuestion<T extends z.infer<typeof questionInput>>(question: T, context: z.RefinementCtx) {
  if (question.type !== "multiple_choice") return;
  if (new Set(question.options).size !== question.options.length || question.options.length < 2) {
    context.addIssue({ code: "custom", path: ["options"], message: "Cần ít nhất 2 phương án khác nhau." });
  }
  if (!question.options.includes(question.correctAnswer)) {
    context.addIssue({ code: "custom", path: ["correctAnswer"], message: "Đáp án phải trùng với nội dung một phương án." });
  }
}

export const questionBatch = z.array(questionInput.superRefine(checkQuestion)).min(1).max(100);
export type ImportedQuestion = z.infer<typeof questionInput>;
