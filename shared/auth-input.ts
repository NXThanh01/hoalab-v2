import { z } from "zod";

export const loginIdInput = z.string().trim().toLowerCase()
  .min(2, "Nhập ID đăng nhập.")
  .max(150, "ID đăng nhập tối đa 150 ký tự.")
  .regex(/^[a-z0-9][a-z0-9._@+\-]*$/, "ID gồm chữ, số hoặc ký tự . _ @ + - và không có dấu cách.");

const currentPassword = z.string().min(1, "Nhập mật khẩu.").max(128, "Mật khẩu tối đa 128 ký tự.");
export const loginInput = z.object({ loginId: loginIdInput, password: currentPassword, rememberMe: z.boolean().default(false) });
export const changePasswordInput = z.object({
  currentPassword,
  newPassword: z.string().min(15, "Mật khẩu mới cần ít nhất 15 ký tự.").max(128, "Mật khẩu tối đa 128 ký tự."),
  confirmation: z.string(),
}).superRefine((input, context) => {
  if (input.newPassword !== input.confirmation) context.addIssue({ code: "custom", path: ["confirmation"], message: "Mật khẩu nhập lại chưa khớp." });
  if (input.newPassword === input.currentPassword) context.addIssue({ code: "custom", path: ["newPassword"], message: "Hãy chọn mật khẩu khác mật khẩu hiện tại." });
});

export const learningViews = ["dashboard", "lesson", "ai", "tools", "courses", "practice", "games", "lab"] as const;
export type LearningView = typeof learningViews[number];
export function safeLearningView(value: unknown): LearningView {
  return learningViews.find((view) => view === value) ?? "dashboard";
}
