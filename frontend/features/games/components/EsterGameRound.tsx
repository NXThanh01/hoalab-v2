"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleCheck, CircleX, Timer } from "lucide-react";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";
import type { EsterGameMode, EsterGameQuestion, EsterGameReview } from "@/shared/ester-games";

const secondsPerQuestion = 30;
const actionClass = "min-h-11 rounded-xl bg-indigo-700 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600";
const verdictLabels = { D: "Đúng", S: "Sai" } as const;
type Verdict = keyof typeof verdictLabels;

export function EsterGameRound({ mode, question, position, total, onNext }: {
  mode: EsterGameMode;
  question: EsterGameQuestion;
  position: number;
  total: number;
  onNext: (correct: boolean) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const [answer, setAnswer] = useState("");
  const [verdicts, setVerdicts] = useState<Partial<Record<number, Verdict>>>({});
  const [deadline] = useState(() => Date.now() + secondsPerQuestion * 1000);
  const [seconds, setSeconds] = useState(secondsPerQuestion);
  const [review, setReview] = useState<EsterGameReview | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expired, setExpired] = useState(false);
  const [error, setError] = useState("");
  const timed = mode === "speed";
  const timedOut = timed && (seconds === 0 || expired);
  const complete = mode === "verdict" ? Object.keys(verdicts).length === question.statements.length : Boolean(answer.trim());

  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (review) feedback.current?.focus(); }, [review]);
  useEffect(() => {
    if (!timed || review || submitting) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, [deadline, review, submitting, timed]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || review || (!complete && !timedOut)) return;
    const outOfTime = timed && Date.now() >= deadline;
    if (outOfTime) setExpired(true);
    const value = outOfTime ? "" : mode === "verdict" ? question.statements.map((_, index) => verdicts[index]).join("") : answer;
    pending.current = true;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/games/ester-lipid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setReview(data as EsterGameReview);
    } catch {
      setError("Chưa thể kiểm tra câu trả lời. Hãy thử lại.");
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
  }

  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex min-h-14 items-center justify-between border-b border-slate-200 px-4 text-sm font-semibold sm:px-6">
      <span>Câu {position} / {total}</span>
      {timed && <span className={seconds <= 5 ? "flex items-center gap-2 text-rose-700" : "flex items-center gap-2 text-slate-600"} role="timer">
        <Timer aria-hidden className="h-4 w-4" /> {timedOut ? "Hết giờ" : `${seconds} giây`}
      </span>}
    </div>
    <progress className="block h-1 w-full accent-indigo-600" max={total} value={position} aria-label="Tiến độ lượt chơi" />
    <form onSubmit={submit} className="space-y-5 p-4 sm:p-6">
      <h2 ref={heading} tabIndex={-1} className="break-words text-lg font-bold leading-relaxed sm:text-xl">
        <ChemicalNotation value={question.prompt} />
      </h2>
      <fieldset disabled={submitting || Boolean(review) || timedOut} className="min-w-0 space-y-3">
        {mode === "speed" && question.options.map((option, index) => (
          <label key={index} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm leading-6 has-checked:border-indigo-600 has-checked:bg-indigo-50">
            <input type="radio" className="h-4 w-4 shrink-0 accent-indigo-700" name="option" value={option} checked={answer === option} onChange={() => setAnswer(option)} />
            <span className="min-w-0 break-words"><ChemicalNotation value={option} /></span>
          </label>
        ))}
        {mode === "verdict" && question.statements.map((statement, index) => (
          <fieldset key={index} className="min-w-0 rounded-xl border border-slate-200 px-3 pb-3">
            <legend className="max-w-full break-words px-1 text-sm leading-6"><strong>{String.fromCharCode(97 + index)})</strong> <ChemicalNotation value={statement} /></legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(Object.entries(verdictLabels) as [Verdict, string][]).map(([value, label]) => (
                <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm has-checked:border-indigo-600 has-checked:bg-indigo-50">
                  <input type="radio" className="accent-indigo-700" name={`statement-${index}`} checked={verdicts[index] === value}
                    onChange={() => setVerdicts((current) => ({ ...current, [index]: value }))} />
                  {label}
                </label>
              ))}
              {review && <span className="self-center text-sm text-slate-700">Đáp án: {verdictLabels[review.correctAnswer[index] as Verdict]}</span>}
            </div>
          </fieldset>
        ))}
        {(mode === "calculation" || mode === "equation") && (
          <label className="block space-y-2 text-sm font-semibold">
            <span>{mode === "calculation" ? "Kết quả (chỉ nhập số)" : "Phương trình cân bằng"}</span>
            <input value={answer} onChange={(event) => setAnswer(event.target.value)}
              inputMode={mode === "calculation" ? "decimal" : "text"}
              autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={500}
              placeholder={mode === "calculation" ? "VD: 12,5" : "VD: 2H2 + O2 -> 2H2O"}
              className="block min-h-12 w-full rounded-xl border border-slate-400 p-3 font-normal focus-visible:outline-2 focus-visible:outline-indigo-700" />
          </label>
        )}
      </fieldset>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {review ? (
        <>
          <div ref={feedback} tabIndex={-1} role="status" className={`space-y-2 rounded-xl p-4 text-sm leading-6 ${review.correct ? "bg-emerald-50 text-emerald-950" : "bg-amber-50 text-amber-950"}`}>
            <p className="flex items-center gap-2 font-bold">
              {review.correct ? <CircleCheck aria-hidden className="h-5 w-5" /> : <CircleX aria-hidden className="h-5 w-5" />}
              {review.correct ? "Chính xác" : expired ? "Hết thời gian" : "Chưa chính xác"}
            </p>
            {mode !== "verdict" && <p><strong>Đáp án:</strong> <ChemicalNotation value={review.correctAnswer} /></p>}
            {review.explanation && <p className="break-words"><ChemicalNotation value={review.explanation} /></p>}
          </div>
          <button type="button" className={`inline-flex items-center gap-2 ${actionClass}`} onClick={() => onNext(review.correct)}>
            {position === total ? "Xem kết quả" : "Câu tiếp"} <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button type="submit" className={actionClass} disabled={submitting || (!complete && !timedOut)}>
          {submitting ? "Đang kiểm tra…" : timedOut ? "Xem đáp án" : "Kiểm tra"}
        </button>
      )}
    </form>
  </article>;
}
