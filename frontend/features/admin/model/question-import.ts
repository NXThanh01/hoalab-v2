import { parse } from "csv-parse/browser/esm/sync";
import { questionBatch, type ImportedQuestion } from "@/shared/question-input";

export async function readQuestionFile(file: File, grade?: number): Promise<ImportedQuestion[]> {
  if (file.size > 1024 * 1024) throw new Error("Tệp câu hỏi tối đa 1 MB.");
  const text = (await file.text()).replace(/^\uFEFF/, "");
  let data: unknown;
  try {
    if (/\.json$/i.test(file.name)) {
      data = JSON.parse(text);
      if (data && typeof data === "object" && "questions" in data) data = data.questions;
    } else if (/\.csv$/i.test(file.name)) {
      data = parse(text, { columns: true, skip_empty_lines: true, trim: true });
    } else {
      throw new Error("FORMAT");
    }
  } catch {
    throw new Error("Không đọc được tệp. Kiểm tra định dạng CSV hoặc JSON theo mẫu.");
  }
  if (!Array.isArray(data) || data.length === 0) throw new Error("Tệp không có danh sách câu hỏi.");
  if (data.length > 100) throw new Error("Mỗi tệp được nhập tối đa 100 câu hỏi.");

  const rows = data.map((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    const row = item as Record<string, unknown>;
    const options = typeof row.options === "string" ? row.options.split("|").map((option) => option.trim()).filter(Boolean) : row.options;
    const answer = typeof row.correctAnswer === "string" ? row.correctAnswer.trim() : row.correctAnswer;
    const optionIndex = typeof answer === "string" && /^[A-F]$/i.test(answer) ? answer.toUpperCase().charCodeAt(0) - 65 : -1;
    return {
      ...row,
      type: row.type || "multiple_choice",
      gradeLevel: grade ?? Number(row.gradeLevel || 12),
      points: Number(row.points || 1),
      difficulty: row.difficulty || "medium",
      options,
      correctAnswer: row.type && row.type !== "multiple_choice" || !Array.isArray(options) || options.includes(answer)
        ? answer
        : options[optionIndex] ?? answer,
    };
  });
  const parsed = questionBatch.safeParse(rows);
  if (!parsed.success) {
    const details = parsed.error.issues.slice(0, 3).map((issue) =>
      `Câu ${Number(issue.path[0]) + 1}${issue.path[1] ? ` (${issue.path[1]})` : ""}: ${issue.message}`);
    throw new Error(details.join(" · "));
  }
  return parsed.data;
}
