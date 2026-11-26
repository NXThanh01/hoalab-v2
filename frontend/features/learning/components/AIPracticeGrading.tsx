"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bot, Check, ChevronRight, LoaderCircle, RefreshCcw, Sparkles, Trophy, X } from "lucide-react";
import { gradeWithAI, type AIGradeResult } from "@/frontend/features/learning/services/ai-grading.service";
import { PASS_SCORE, practiceQuestions, type PracticeQuestion } from "@/frontend/features/learning/data/lesson.data";
import { useLearning } from "@/frontend/features/learning/model/LearningContext";

type Props = { onPassed: () => void };

function shuffle<T>(items: T[]): T[] {
  return [...items]
    .map((value) => ({ value, rank: Math.random() }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ value }) => value);
}

function shuffleQuestion(question: PracticeQuestion): PracticeQuestion {
  const paired = question.options.map((option, index) => ({
    option,
    isCorrect: index === question.correct,
  }));
  const shuffled = shuffle(paired);
  return {
    ...question,
    options: shuffled.map((item) => item.option),
    correct: shuffled.findIndex((item) => item.isCorrect),
  };
}

export function AIPracticeGrading({ onPassed }: Props) {
  const { completeLesson } = useLearning();
  const [questions, setQuestions] = useState<PracticeQuestion[]>(practiceQuestions);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [essay, setEssay] = useState("");
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<{ total: number; multipleChoice: number; ai: AIGradeResult } | null>(null);
  const allAnswered = useMemo(() => questions.every((question) => answers[question.id] !== undefined) && essay.trim().length > 10, [answers, essay, questions]);

  async function submit() {
    if (!allAnswered || grading) return;
    setGrading(true);
    try {
      const multipleChoice = questions.reduce((score, question) => score + (answers[question.id] === question.correct ? 2 : 0), 0);
      const ai = await gradeWithAI(essay);
      const total = Number(Math.min(10, multipleChoice + ai.score).toFixed(1));
      setResult({ total, multipleChoice, ai });
      if (total >= PASS_SCORE) {
        completeLesson(1, total);
        onPassed();
      }
    } catch {
      setResult({
        total: questions.reduce((score, question) => score + (answers[question.id] === question.correct ? 2 : 0), 0),
        multipleChoice: questions.reduce((score, question) => score + (answers[question.id] === question.correct ? 2 : 0), 0),
        ai: { score: 0, feedback: "Dịch vụ AI tạm thời chưa phản hồi. Em có thể thử nộp lại ngay.", strengths: [], improvements: ["Kiểm tra kết nối và nộp lại phần tự luận."], model: "mock" },
      });
    } finally {
      setGrading(false);
    }
  }

  function retry() {
    setQuestions(shuffle(practiceQuestions).map(shuffleQuestion));
    setAnswers({});
    setEssay("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="section-eyebrow">Phần 2 · Mở khóa sau video</p><h2 className="text-2xl font-black tracking-tight text-slate-900">Luyện tập tổng hợp cuối bài</h2><p className="mt-1 text-xs text-slate-500">Đạt tối thiểu {PASS_SCORE}/10 để hoàn thành bài và mở khóa bài tiếp theo.</p></div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-600">3 trắc nghiệm · 1 tự luận AI</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="space-y-4">
          {questions.map((question, index) => (
            <article key={question.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-black text-white">{index + 1}</span><div className="flex-1"><h3 className="text-sm font-bold leading-6 text-slate-800">{question.question}</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => { const selected = answers[question.id] === optionIndex; return <button key={option} onClick={() => !result && setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition ${selected ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700 ring-2 ring-indigo-100" : "border-slate-200 text-slate-600 hover:border-indigo-200"}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${selected ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300"}`}>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>; })}</div></div></div>
            </article>
          ))}
          <article className="rounded-[22px] border border-violet-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><Bot className="h-4 w-4" /></span><div><div className="flex items-center gap-2"><h3 className="text-sm font-black text-slate-800">Câu tự luận · AI chấm điểm</h3><span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-bold text-violet-600">4 điểm</span></div><p className="mt-1 text-xs leading-5 text-slate-600">Viết phương trình ester hóa giữa acid acetic và ethanol; nêu điều kiện và đặc điểm phản ứng.</p></div></div>
            <textarea value={essay} onChange={(event) => !result && setEssay(event.target.value)} className="min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100" placeholder="Trình bày từng bước suy luận của em..." />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400"><span>AI phân tích cấu hình, lập luận và cách diễn đạt</span><span>{essay.length} ký tự</span></div>
          </article>
        </div>

        <aside className="h-fit rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500"><Trophy className="h-5 w-5" /></span><div><p className="text-xs font-black text-slate-800">Điều kiện qua bài</p><p className="text-xs text-slate-400">Điểm yêu cầu ≥ {PASS_SCORE}.0</p></div></div>
          <div className="my-5 space-y-3">{questions.map((question, index) => <div key={question.id} className="flex items-center justify-between text-xs"><span className="text-slate-500">Câu {index + 1}</span><span className={`grid h-5 w-5 place-items-center rounded-full ${answers[question.id] !== undefined ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{answers[question.id] !== undefined ? <Check className="h-3 w-3" /> : index + 1}</span></div>)}<div className="flex items-center justify-between text-xs"><span className="text-slate-500">Tự luận</span><span className={`text-xs font-bold ${essay.length > 10 ? "text-emerald-600" : "text-slate-400"}`}>{essay.length > 10 ? "Đã trả lời" : "Chưa đủ ý"}</span></div></div>
          <button disabled={!allAnswered || grading || !!result} onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">{grading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> AI đang chấm...</> : <>Nộp bài & chấm điểm <ChevronRight className="h-4 w-4" /></>}</button>
          <p className="mt-3 text-center text-xs leading-4 text-slate-400">Kết quả được lưu tự động vào tiến độ học tập.</p>
        </aside>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: .92, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className={`relative overflow-hidden px-6 py-7 text-white ${result.total >= PASS_SCORE ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-orange-500 to-rose-500"}`}>
                <Sparkles className="absolute -right-4 -top-4 h-32 w-32 opacity-10" />
                <button onClick={() => setResult(null)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/15"><X className="h-4 w-4" /></button>
                <div className="flex items-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-full border-4 border-white/25 bg-white/15"><span className="text-3xl font-black">{result.total}</span></div><div><p className="text-xs font-bold uppercase tracking-widest text-white/70">Kết quả của bạn</p><h3 className="mt-1 text-2xl font-black">{result.total >= PASS_SCORE ? "Xuất sắc, em đã qua bài!" : "Chưa đạt — cố thêm một chút!"}</h3><p className="mt-1 text-xs text-white/80">Trắc nghiệm {result.multipleChoice}/6 · Tự luận {result.ai.score}/4</p></div></div>
              </div>
              <div className="p-6">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2"><Bot className="h-4 w-4 text-indigo-600" /><p className="text-xs font-black text-slate-700">Nhận xét từ AI</p><span className="ml-auto rounded-md bg-white px-2 py-1 text-xs uppercase text-slate-400">{result.ai.model === "mock" ? "Demo engine" : "OpenAI"}</span></div><p className="text-xs leading-5 text-slate-600">{result.ai.feedback}</p><ul className="mt-3 space-y-1.5">{result.ai.improvements.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-slate-500"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{item}</li>)}</ul></div>
                {result.total >= PASS_SCORE ? <button onClick={() => { setResult(null); onPassed(); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-black text-white">Học bài tiếp theo <ChevronRight className="h-4 w-4" /></button> : <button onClick={retry} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white"><RefreshCcw className="h-4 w-4" /> Làm lại bài tập</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
