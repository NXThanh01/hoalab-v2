import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/database/client";
import { examQuestions, exams, questionBank } from "@/database/schema";
import type { EsterGameMode, EsterGameQuestion } from "@/shared/ester-games";

// The three published quizzes imported from the 150-question Ester – Lipid document.
const sourceQuizIds = [
  "abde3e20-d26d-4283-8e6a-0c071bdd275e",
  "4a94df0c-a213-4fcf-824e-eec2e451285f",
  "639cbfbb-bc13-4107-8097-133cc6ca0d2a",
];

export async function loadEsterGameBank(questionId?: string) {
  return getDb().selectDistinct({
    id: questionBank.id,
    type: questionBank.type,
    prompt: questionBank.prompt,
    optionsJson: questionBank.optionsJson,
    correctAnswer: questionBank.correctAnswer,
    explanation: questionBank.explanation,
  }).from(questionBank)
    .innerJoin(examQuestions, eq(examQuestions.questionId, questionBank.id))
    .innerJoin(exams, eq(examQuestions.examId, exams.id))
    .where(and(
      inArray(exams.id, sourceQuizIds),
      eq(exams.status, "published"),
      eq(exams.gradeLevel, 12),
      eq(questionBank.gradeLevel, 12),
      questionId ? eq(questionBank.id, questionId) : undefined,
    ));
}

type BankQuestion = Awaited<ReturnType<typeof loadEsterGameBank>>[number];

export function splitEsterGameQuestion(row: BankQuestion): { mode: EsterGameMode; question: EsterGameQuestion } | null {
  let prompt = row.prompt.replace(/^Câu \d+\.\s*/i, "");
  const question = { id: row.id, prompt, options: [] as string[], statements: [] as string[] };
  if (!row.correctAnswer.trim()) return null;

  if (row.type === "multiple_choice") {
    const options: string[] = JSON.parse(row.optionsJson);
    if (options.length < 2 || !options.includes(row.correctAnswer)) return null;
    return { mode: "speed", question: { ...question, options } };
  }
  if (row.type === "equation") {
    prompt = prompt.replace(/\s*Gõ chỉ số bằng số thường.*$/u, "");
    return { mode: "equation", question: { ...question, prompt } };
  }
  if (/^[DS]{4}$/.test(row.correctAnswer)) {
    const [context, ...statements] = prompt.replace(/\s*Nhập 4 ký tự.*$/u, "").split(/\s*(?:·\s*)?[a-d]\)\s*/u);
    if (statements.length !== 4) return null;
    return { mode: "verdict", question: { ...question, prompt: context.trim(), statements } };
  }
  if (/^[+-]?\d+(?:\.\d+)?$/.test(row.correctAnswer)) {
    prompt = prompt.replace(/\s*Chỉ nhập số,.*$/u, "");
    return { mode: "calculation", question: { ...question, prompt } };
  }
  return null;
}

function normalizeEquation(value: string) {
  const sides = value.trim().replace(/\s/g, "")
    .replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit)))
    .replace(/\.(?=$)/, "").split(/→|->|=/);
  if (sides.length !== 2 || sides.some((side) => !side)) return null;
  return sides.map((side) => side.split("+").map((term) => term.replace(/^1(?=[A-Z])/, "")).sort().join("+")).join("→");
}

export function checkEsterGameAnswer(mode: EsterGameMode, answer: string, key: string) {
  const value = answer.trim();
  if (!value) return false;
  if (mode === "equation") {
    const normalized = normalizeEquation(value);
    return normalized !== null && normalized === normalizeEquation(key);
  }
  if (mode === "calculation") {
    const decimal = value.replace(",", ".");
    return /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(decimal) && Number(decimal) === Number(key);
  }
  return value === key;
}
