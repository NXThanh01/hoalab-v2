"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Bookmark, BookmarkCheck, BookOpenCheck, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Expand, FolderOpen, History, LoaderCircle, Minimize, Radio, RotateCcw, Save, Send, ShieldAlert, ShieldCheck, Trophy, XCircle } from "lucide-react";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";

type ExamQuestion = { id: string; type: "multiple_choice" | "essay" | "equation"; prompt: string; options: string[]; points: number };
type PublishedExam = { id: string; title: string; description: string; gradeLevel: number; folderId: string | null; folderName: string; kind: "quiz" | "exam"; durationMinutes: number; passScore: number; questions: ExamQuestion[] };
type IntegrityState = { tabSwitches: number; fullscreenExits: number; elapsedSeconds: number; fullscreenUsed: boolean };
type ReviewItem = { questionId: string; prompt: string; answer: string; correctAnswer: string; explanation: string; correct: boolean; earnedPoints: number; maxPoints: number };
type ExamResult = { attemptId: string; score: number; passed: boolean; correct: number; total: number; integrity: IntegrityState; review: ReviewItem[] };
type AttemptHistory = { id: string; examTitle: string; score: number; passed: boolean; submittedAt: string | null };

const emptyIntegrity: IntegrityState = { tabSwitches: 0, fullscreenExits: 0, elapsedSeconds: 0, fullscreenUsed: false };

function timeLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function PublishedExams({ gradeLevel = 12 }: { gradeLevel?: number }) {
  const [exams, setExams] = useState<PublishedExam[]>([]);
  const [history, setHistory] = useState<AttemptHistory[]>([]);
  const [active, setActive] = useState<PublishedExam | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [integrity, setIntegrity] = useState<IntegrityState>(emptyIntegrity);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roomNotice, setRoomNotice] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const trackingRef = useRef(false);
  const enteredFullscreenRef = useRef(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [examResponse, historyResponse] = await Promise.all([
          fetch("/api/exams", { cache: "no-store" }),
          fetch("/api/exams/attempts", { cache: "no-store" }),
        ]);
        const examData = await examResponse.json() as { exams: PublishedExam[] };
        const historyData = await historyResponse.json() as { attempts: AttemptHistory[] };
        if (alive) {
          setExams(examData.exams.filter((exam) => exam.gradeLevel === gradeLevel));
          setHistory(historyData.attempts ?? []);
        }
      } finally { if (alive) setLoading(false); }
    }
    void load();
    const interval = window.setInterval(load, 20_000);
    return () => { alive = false; window.clearInterval(interval); };
  }, [gradeLevel]);

  const storageKey = active ? `hoalab-exam-draft:${active.id}` : "";
  const answered = active ? active.questions.filter((item) => Boolean(answers[item.id]?.trim())).length : 0;
  const question = active?.questions[current];
  const totalViolations = integrity.tabSwitches + integrity.fullscreenExits;
  const folders = Array.from(new Map(exams.map((exam) => [exam.folderId ?? "unfiled", { id: exam.folderId ?? "unfiled", name: exam.folderName }])).values());
  const visibleExams = exams.filter((exam) => (exam.folderId ?? "unfiled") === selectedFolder);

  useEffect(() => {
    if (!active || result) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [active, result]);

  useEffect(() => {
    if (!active || !storageKey || result) return;
    localStorage.setItem(storageKey, JSON.stringify({ answers, flagged, current, remaining, integrity, savedAt: new Date().toISOString() }));
  }, [active, answers, current, flagged, integrity, remaining, result, storageKey]);

  useEffect(() => {
    if (!active || result) return;
    trackingRef.current = true;
    function onVisibilityChange() {
      if (!trackingRef.current || !document.hidden) return;
      setIntegrity((state) => ({ ...state, tabSwitches: state.tabSwitches + 1 }));
      setRoomNotice("Hệ thống đã ghi nhận một lần rời khỏi tab làm bài.");
    }
    function onFullscreenChange() {
      const fullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(fullscreen);
      if (fullscreen) {
        enteredFullscreenRef.current = true;
        setIntegrity((state) => ({ ...state, fullscreenUsed: true }));
      } else if (trackingRef.current && enteredFullscreenRef.current) {
        setIntegrity((state) => ({ ...state, fullscreenExits: state.fullscreenExits + 1 }));
        setRoomNotice("Hệ thống đã ghi nhận một lần thoát chế độ toàn màn hình.");
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      trackingRef.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [active, result]);

  const submit = useCallback(async () => {
    if (!active || submitting) return;
    setSubmitting(true);
    trackingRef.current = false;
    const finalIntegrity = { ...integrity, elapsedSeconds: Math.max(0, active.durationMinutes * 60 - remaining) };
    try {
      const response = await fetch("/api/exams/attempts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ examId: active.id, answers, integrity: finalIntegrity }) });
      if (!response.ok) throw new Error("Không thể nộp bài. Hãy kiểm tra kết nối và thử lại.");
      const data = await response.json() as ExamResult;
      setResult(data);
      setIntegrity(finalIntegrity);
      localStorage.removeItem(`hoalab-exam-draft:${active.id}`);
      setConfirmSubmit(false);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      setHistory((items) => [{ id: data.attemptId, examTitle: active.title, score: data.score, passed: data.passed, submittedAt: new Date().toISOString() }, ...items]);
    } catch (error) {
      setRoomNotice(error instanceof Error ? error.message : "Không thể nộp bài.");
      trackingRef.current = true;
    } finally { setSubmitting(false); }
  }, [active, answers, integrity, remaining, submitting]);

  useEffect(() => {
    if (!active || remaining !== 0 || result || loading) return;
    const autoSubmit = window.setTimeout(() => void submit(), 0);
    return () => window.clearTimeout(autoSubmit);
  }, [active, loading, remaining, result, submit]);

  async function enterFullscreen() {
    if (!document.fullscreenEnabled) { setRoomNotice("Trình duyệt hiện tại không hỗ trợ toàn màn hình. Bài thi vẫn tiếp tục bình thường."); return; }
    try {
      await document.documentElement.requestFullscreen();
      enteredFullscreenRef.current = true;
      setIsFullscreen(true);
      setIntegrity((state) => ({ ...state, fullscreenUsed: true }));
      setRoomNotice("");
    }
    catch { setRoomNotice("Không thể bật toàn màn hình tự động. Hãy dùng nút Toàn màn hình để thử lại."); }
  }

  function startExam(exam: PublishedExam) {
    const key = `hoalab-exam-draft:${exam.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { answers?: Record<string, string>; flagged?: string[]; current?: number; remaining?: number; integrity?: IntegrityState };
        setAnswers(parsed.answers ?? {});
        setFlagged(parsed.flagged ?? []);
        setCurrent(Math.min(parsed.current ?? 0, exam.questions.length - 1));
        setRemaining(parsed.remaining && parsed.remaining > 0 ? parsed.remaining : exam.durationMinutes * 60);
        setIntegrity(parsed.integrity ?? emptyIntegrity);
      } catch { localStorage.removeItem(key); setRemaining(exam.durationMinutes * 60); setIntegrity(emptyIntegrity); }
    } else {
      setAnswers({}); setFlagged([]); setCurrent(0); setRemaining(exam.durationMinutes * 60); setIntegrity(emptyIntegrity);
    }
    enteredFullscreenRef.current = false;
    setResult(null);
    setRoomNotice("");
    setActive(exam);
    void enterFullscreen();
  }

  async function leaveRoom() {
    trackingRef.current = false;
    setActive(null); setResult(null); setConfirmSubmit(false); setCurrent(0); setRoomNotice("");
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
  }

  const progress = active?.questions.length ? (answered / active.questions.length) * 100 : 0;
  const warning = remaining <= 300;

  if (loading) return <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-indigo-500" /></section>;

  if (active) return <section className="mt-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
    <header className="bg-slate-950 px-5 py-4 text-white"><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => void leaveRoom()} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10" aria-label="Rời phòng thi"><ArrowLeft className="h-4 w-4" /></button><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.18em] text-indigo-300">Phòng thi thử · Hóa học 12</p><h2 className="mt-1 truncate text-base font-black">{active.title}</h2></div><button type="button" onClick={() => isFullscreen ? document.exitFullscreen() : void enterFullscreen()} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold">{isFullscreen ? <Minimize className="h-4 w-4" /> : <Expand className="h-4 w-4" />}{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</button><div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black ${warning ? "bg-rose-500 text-white" : "bg-white/10"}`}><Clock3 className="h-4 w-4" />{timeLabel(remaining)}</div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all" style={{ width: `${progress}%` }} /></div></header>
    {roomNotice && !result && <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-bold text-amber-700"><ShieldAlert className="h-4 w-4" />{roomNotice}</div>}
    {result ? <ResultPanel result={result} onRetry={() => startExam(active)} onExit={() => void leaveRoom()} /> : <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]"><div className="p-5 sm:p-7">{question && <article><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-indigo-500">Câu {current + 1} / {active.questions.length}</p><h3 className="mt-3 text-lg font-black leading-7 text-slate-800"><ChemicalNotation value={question.prompt} /></h3></div><button type="button" onClick={() => setFlagged((items) => items.includes(question.id) ? items.filter((id) => id !== question.id) : [...items, question.id])} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${flagged.includes(question.id) ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{flagged.includes(question.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />} Xem lại</button></div>{question.options.length ? <div className="mt-6 grid gap-3">{question.options.map((option, index) => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition ${answers[question.id] === option ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100" : "border-slate-200 text-slate-600 hover:border-indigo-200"}`}><input type="radio" name={question.id} value={option} checked={answers[question.id] === option} onChange={() => setAnswers((state) => ({ ...state, [question.id]: option }))} className="sr-only" /><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-black ${answers[question.id] === option ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-300"}`}>{String.fromCharCode(65 + index)}</span><ChemicalNotation value={option} /></label>)}</div> : <textarea value={answers[question.id] ?? ""} onChange={(event) => setAnswers((state) => ({ ...state, [question.id]: event.target.value }))} rows={6} className="mt-6 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-indigo-300 focus:bg-white" placeholder="Nhập phương trình hoặc lời giải..." />}<div className="mt-7 flex items-center justify-between"><button type="button" disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /> Câu trước</button>{current < active.questions.length - 1 ? <button type="button" onClick={() => setCurrent((value) => Math.min(active.questions.length - 1, value + 1))} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Câu tiếp <ChevronRight className="h-4 w-4" /></button> : <button type="button" onClick={() => setConfirmSubmit(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white"><Send className="h-4 w-4" /> Nộp bài</button>}</div></article>}</div><aside className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-slate-800">Bảng câu hỏi</h3><span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><Save className="h-3.5 w-3.5" /> Tự lưu</span></div><p className="mt-1 text-xs text-slate-400">Đã trả lời {answered}/{active.questions.length}</p><div className="mt-4 grid grid-cols-5 gap-2">{active.questions.map((item, index) => { const done = Boolean(answers[item.id]?.trim()); const marked = flagged.includes(item.id); return <button type="button" key={item.id} onClick={() => setCurrent(index)} className={`relative grid aspect-square place-items-center rounded-lg text-xs font-black transition ${current === index ? "bg-indigo-600 text-white ring-2 ring-indigo-200" : done ? "bg-emerald-100 text-emerald-700" : "border border-slate-200 bg-white text-slate-500"}`}>{index + 1}{marked && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-slate-50 bg-amber-400" />}</button>; })}</div><div className={`mt-5 rounded-2xl border p-4 ${totalViolations ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}><div className="flex items-center gap-2 text-xs font-black"><ShieldCheck className={`h-4 w-4 ${totalViolations ? "text-amber-600" : "text-emerald-600"}`} /> Giám sát phiên thi</div><div className="mt-3 grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-white/70 p-2"><p className="text-lg font-black">{integrity.tabSwitches}</p><p className="text-[10px] text-slate-500">Rời tab</p></div><div className="rounded-xl bg-white/70 p-2"><p className="text-lg font-black">{integrity.fullscreenExits}</p><p className="text-[10px] text-slate-500">Thoát màn hình</p></div></div><p className="mt-3 text-[10px] leading-4 text-slate-500">Tín hiệu chỉ phục vụ đối chiếu, không tự động trừ điểm.</p></div><button type="button" onClick={() => setConfirmSubmit(true)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-black text-white"><Send className="h-4 w-4" /> Nộp bài thi</button></aside></div>}
    {confirmSubmit && !result && <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-500"><AlertTriangle className="h-6 w-6" /></span><h3 className="mt-4 text-xl font-black">Xác nhận nộp bài?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Bạn đã trả lời {answered}/{active.questions.length} câu, còn {timeLabel(remaining)}. Hệ thống ghi nhận {totalViolations} tín hiệu rời màn hình.</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setConfirmSubmit(false)} className="rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">Kiểm tra lại</button><button type="button" disabled={submitting} onClick={() => void submit()} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white">{submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Nộp bài</button></div></div></div>}
  </section>;

  if (!selectedFolder && folders.length) return <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{folders.map((folder) => { const count = exams.filter((exam) => (exam.folderId ?? "unfiled") === folder.id).length; return <button key={folder.id} type="button" onClick={() => setSelectedFolder(folder.id)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-500"><FolderOpen className="h-6 w-6 fill-current" /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{count} mục</span></div><h3 className="mt-4 text-lg font-black text-slate-800">{folder.name}</h3><p className="mt-2 text-sm text-slate-500">Mở thư mục để xem quiz và đề thi.</p></button>; })}</section>;

  return <section className="mt-8"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><button type="button" onClick={() => setSelectedFolder(null)} className="mb-3 flex items-center gap-2 text-sm font-bold text-indigo-600"><ArrowLeft className="h-4 w-4" /> Về danh sách thư mục</button><p className="section-eyebrow">Hóa học {gradeLevel}</p><h2 className="text-2xl font-black text-slate-900">Quiz và đề thi</h2><p className="mt-2 text-sm text-slate-500">Toàn màn hình · Tự lưu · Theo dõi rời tab · Chấm điểm chi tiết.</p></div><span className="flex items-center gap-2 text-xs font-bold text-emerald-600"><Radio className="h-4 w-4" /> Đồng bộ đề mỗi 20 giây</span></div>{visibleExams.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleExams.map((exam) => <article key={exam.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl ${exam.kind === "quiz" ? "bg-sky-50 text-sky-600" : "bg-indigo-50 text-indigo-600"}`}><BookOpenCheck className="h-5 w-5" /></span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-600">{exam.kind === "quiz" ? "Quiz" : "Đề thi"}</span></div><h3 className="mt-4 text-lg font-black text-slate-800">{exam.title}</h3><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500">{exam.description}</p><div className="mt-4 flex gap-4 text-xs font-semibold text-slate-400"><span>{exam.questions.length} câu</span><span>{exam.durationMinutes} phút</span><span>Đạt {exam.passScore}/10</span></div><button type="button" onClick={() => startExam(exam)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-indigo-600"><Expand className="h-4 w-4" /> {exam.kind === "quiz" ? "Làm quiz" : "Vào phòng thi"}</button></article>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center"><BookOpenCheck className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-400">Thư mục chưa có nội dung đã xuất bản.</p></div>}{history.length > 0 && <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><History className="h-5 w-5 text-indigo-600" /><h3 className="font-black">Lịch sử làm bài gần đây</h3></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{history.slice(0, 6).map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><p className="line-clamp-1 text-sm font-bold text-slate-700">{item.examTitle}</p><div className="mt-3 flex items-center justify-between"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${item.passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{item.score}/10</span><span className="text-[10px] text-slate-400">{item.submittedAt ? new Date(item.submittedAt).toLocaleString("vi-VN") : "—"}</span></div></div>)}</div></div>}</section>;
}

function ResultPanel({ result, onRetry, onExit }: { result: ExamResult; onRetry: () => void; onExit: () => void }) {
  const violations = result.integrity.tabSwitches + result.integrity.fullscreenExits;
  return <div className="p-5 sm:p-8"><div className="text-center"><span className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${result.passed ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>{result.passed ? <Trophy className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}</span><h3 className="mt-5 text-4xl font-black">{result.score}/10</h3><p className="mt-2 text-sm text-slate-500">Đúng {result.correct}/{result.total} câu · {result.passed ? "Đã đạt yêu cầu" : "Chưa đạt ngưỡng"}</p><div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-4 rounded-2xl bg-slate-50 p-3 text-xs text-slate-500"><span><strong className="text-slate-800">{result.integrity.tabSwitches}</strong> lần rời tab</span><span><strong className="text-slate-800">{result.integrity.fullscreenExits}</strong> lần thoát toàn màn hình</span></div>{violations > 0 && <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-amber-700">Các tín hiệu giám sát đã được gửi về Admin Studio nhưng không tự động thay đổi điểm kiến thức.</p>}<div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3"><button type="button" onClick={onExit} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Về danh sách</button><button type="button" onClick={onRetry} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"><RotateCcw className="h-4 w-4" /> Làm lại</button></div></div><div className="mx-auto mt-10 max-w-4xl"><h4 className="text-lg font-black">Đối chiếu đáp án</h4><div className="mt-4 space-y-3">{result.review.map((item, index) => <article key={item.questionId} className={`rounded-2xl border p-4 ${item.correct ? "border-emerald-200 bg-emerald-50/50" : "border-rose-200 bg-rose-50/50"}`}><div className="flex items-start gap-3"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${item.correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>{item.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Câu {index + 1} · {item.earnedPoints}/{item.maxPoints} điểm</p><p className="mt-2 text-sm font-bold leading-6"><ChemicalNotation value={item.prompt} /></p><div className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><p className="rounded-xl bg-white/70 p-3"><span className="block font-bold text-slate-400">Bạn trả lời</span><span className="mt-1 block text-slate-700"><ChemicalNotation value={item.answer || "Chưa trả lời"} /></span></p><p className="rounded-xl bg-white/70 p-3"><span className="block font-bold text-slate-400">Đáp án đúng</span><span className="mt-1 block text-slate-700"><ChemicalNotation value={item.correctAnswer} /></span></p></div>{item.explanation && <p className="mt-3 text-xs leading-5 text-slate-600"><strong>Giải thích:</strong> <ChemicalNotation value={item.explanation} /></p>}</div></div></article>)}</div></div></div>;
}
