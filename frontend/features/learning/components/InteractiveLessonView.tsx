"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Atom,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FastForward,
  Gauge,
  Lightbulb,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { checkpoints, VIDEO_DURATION, type Checkpoint } from "@/frontend/features/learning/data/lesson.data";
import { useLearning } from "@/frontend/features/learning/model/LearningContext";
import { AIPracticeGrading } from "@/frontend/features/learning/components/AIPracticeGrading";
import { FloatingNotebookWidget } from "@/frontend/features/learning/components/FloatingNotebookWidget";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";
import { useInteractiveVideo } from "@/frontend/features/learning/hooks/useInteractiveVideo";

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function CheckpointOverlay({ checkpoint, onCorrect }: { checkpoint: Checkpoint; onCorrect: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);

  function checkAnswer() {
    if (selected === null) return;
    if (selected === checkpoint.correct) onCorrect();
    else setWrong(true);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 grid place-items-center bg-[#09081d]/85 p-4 backdrop-blur-md">
      <motion.div initial={{ scale: .92, y: 15 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-xl overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><Lightbulb className="h-4 w-4" /></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-indigo-200">Kiểm tra nhanh · {formatTime(checkpoint.time)}</p><h3 className="text-sm font-black">Dừng một chút để nhớ lâu hơn</h3></div></div></div>
        <div className="p-5"><p className="text-sm font-bold leading-6 text-slate-800">{checkpoint.question}</p><div className="mt-4 grid gap-2">{checkpoint.options.map((option, index) => <button key={option} onClick={() => { setSelected(index); setWrong(false); }} className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-xs transition ${selected === index ? "border-indigo-500 bg-indigo-50 font-semibold text-indigo-700 ring-2 ring-indigo-100" : "border-slate-200 text-slate-600 hover:border-indigo-200"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs ${selected === index ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300"}`}>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
          <AnimatePresence>{wrong && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-600"><strong>Chưa chính xác.</strong> {checkpoint.explanation} Hãy chọn lại đáp án đúng nhé.</motion.div>}</AnimatePresence>
          <button onClick={checkAnswer} disabled={selected === null} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-black text-white transition hover:bg-indigo-600 disabled:opacity-30">Kiểm tra đáp án <ChevronRight className="h-4 w-4" /></button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function InteractiveLessonView() {
  const { setView } = useLearning();
  const {
    activeCheckpoint,
    answerCheckpoint,
    completedCheckpoints,
    currentTime,
    playing,
    progress,
    reset,
    seek,
    setPlaying,
    setSpeed,
    speed,
    videoComplete,
  } = useInteractiveVideo();
  const [lessonPassed, setLessonPassed] = useState(false);

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f7f8fc] pb-20 lg:ml-[232px]">
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3"><button onClick={() => setView("dashboard")} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600" aria-label="Quay lại trang chủ"><ArrowLeft className="h-4 w-4" /></button><div><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span>Hóa học 12</span><ChevronRight className="h-3 w-3" /><span>Chương 1 · Hóa hữu cơ</span></div><h1 className="mt-1 text-base font-black text-slate-900">Bài 1: Ester và Lipid</h1></div></div>
          <div className="flex items-center gap-2 overflow-x-auto"><span className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600"><Play className="h-3.5 w-3.5" /> 1. Video tương tác</span><ChevronRight className="h-3.5 w-3.5 text-slate-300" /><span className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${videoComplete ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{videoComplete ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3.5 w-3.5" />} 2. Luyện tập cuối bài</span></div>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:px-8">
        <div>
          <div className="video-shell relative aspect-video min-h-[320px] overflow-hidden rounded-[26px] bg-[#080718] shadow-[0_24px_70px_rgba(15,23,42,.25)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_42%,rgba(99,102,241,.28),transparent_28%),linear-gradient(135deg,#09091f,#17123f)]" />
            <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="absolute left-6 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur-md">HóaLab Studio · Hóa hữu cơ 12</div>
            <div className="absolute inset-0 flex items-center justify-center pb-16">
              <div className="relative flex h-[210px] w-[420px] max-w-[80vw] flex-col items-center justify-center">
                <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-fuchsia-500/20 blur-3xl" />
                <div className="relative rounded-[28px] border border-white/15 bg-white/10 px-8 py-6 text-center shadow-[0_0_80px_rgba(139,92,246,.35)] backdrop-blur-md"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Phản ứng ester hóa</p><p className="mt-4 text-lg font-black text-white"><ChemicalNotation value="CH_3COOH + C_2H_5OH ⇌ CH_3COOC_2H_5 + H_2O" /></p><p className="mt-3 text-xs text-indigo-200">H_2SO_4 đặc · đun nóng</p></div>
                <div className="absolute bottom-0 text-center"><p className="text-lg font-black text-white">Ethyl acetate</p><p className="mt-1 text-xs text-indigo-200">Mùi thơm đặc trưng · ít tan trong nước</p></div>
              </div>
            </div>
            {!playing && !activeCheckpoint && !videoComplete && <button onClick={() => setPlaying(true)} className="absolute left-1/2 top-1/2 z-10 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-indigo-700 shadow-2xl transition hover:scale-105" aria-label="Phát video"><Play className="ml-1 h-6 w-6 fill-current" /></button>}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-4 pt-16 text-white">
              <div className="relative h-1.5 rounded-full bg-white/20"><div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400" style={{ width: `${progress}%` }} />{checkpoints.map((checkpoint) => <span key={checkpoint.id} title={`Câu hỏi tại ${formatTime(checkpoint.time)}`} className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${completedCheckpoints.includes(checkpoint.id) ? "bg-emerald-400" : "bg-amber-400"}`} style={{ left: `${(checkpoint.time / VIDEO_DURATION) * 100}%` }} />)}<input aria-label="Thanh thời gian video" type="range" min="0" max={VIDEO_DURATION} value={currentTime} onChange={(event) => seek(Number(event.target.value))} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" /></div>
              <div className="mt-3 flex items-center gap-4"><button onClick={() => setPlaying((value) => !value)} className="text-white">{playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}</button><Volume2 className="h-4 w-4" /><span className="text-xs font-medium">{formatTime(currentTime)} / {formatTime(VIDEO_DURATION)}</span><button onClick={() => setSpeed((value) => value === 1 ? 12 : 1)} className={`ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${speed > 1 ? "bg-amber-400 text-slate-900" : "bg-white/10"}`}><FastForward className="h-3 w-3" /> {speed}×</button><Gauge className="h-4 w-4" /></div>
            </div>
            <AnimatePresence>{activeCheckpoint && <CheckpointOverlay checkpoint={activeCheckpoint} onCorrect={answerCheckpoint} />}</AnimatePresence>
            {videoComplete && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20 grid place-items-center bg-[#09081d]/80 p-6 text-center backdrop-blur-md"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"><CheckCircle2 className="h-8 w-8" /></span><h3 className="mt-4 text-xl font-black text-white">Bạn đã hoàn thành video!</h3><p className="mt-2 max-w-md text-xs leading-5 text-indigo-100/70">Hai điểm kiểm tra giữa video đã hoàn tất. Phần luyện tập tổng hợp đã được mở khóa.</p><button onClick={() => document.getElementById("practice")?.scrollIntoView({ behavior: "smooth" })} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-indigo-700">Bắt đầu luyện tập <ChevronRight className="h-4 w-4" /></button></div></motion.div>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3"><p className="flex items-center gap-2 text-xs text-indigo-700"><Lightbulb className="h-4 w-4" /><strong>Mẹo trải nghiệm:</strong> Bật tốc độ 12× để chạy nhanh bản demo; video vẫn dừng đúng mốc 01:30 và 03:45.</p>{currentTime > 0 && <button onClick={reset} className="flex items-center gap-1 text-xs font-bold text-indigo-600"><RotateCcw className="h-3 w-3" /> Xem lại</button>}</div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><p className="section-eyebrow">Nội dung bài học</p><h2 className="section-title">Mục tiêu cần đạt</h2><div className="mt-4 space-y-3">{["Nhận biết cấu tạo và danh pháp ester", "Viết phản ứng ester hóa", "Giải bài toán xà phòng hóa", "Phân biệt lipid no và không no"].map((item, index) => <div key={item} className="flex items-start gap-2.5"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${currentTime / VIDEO_DURATION > index * .23 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>{currentTime / VIDEO_DURATION > index * .23 ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}</span><span className="text-xs leading-5 text-slate-600">{item}</span></div>)}</div></div>
          <div className="rounded-[22px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-5 text-white"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-cyan-300"><Atom className="h-5 w-5" /></span><div><p className="text-xs font-black">Tiến độ bài học</p><p className="text-xs text-indigo-200">{Math.round(progress)}% video</p></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-4 grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-white/5 p-2"><p className="text-sm font-black">{completedCheckpoints.length}/2</p><p className="text-xs text-indigo-200">Checkpoint</p></div><div className="rounded-xl bg-white/5 p-2"><p className="text-sm font-black">{formatTime(currentTime)}</p><p className="text-xs text-indigo-200">Thời lượng</p></div></div></div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="text-xs font-black text-slate-700">Các phần trong bài</h3><Clock3 className="h-4 w-4 text-slate-400" /></div><div className="mt-3 space-y-2">{[{ t: "0:00", l: "Khái niệm ester" }, { t: "1:30", l: "Danh pháp và tính chất" }, { t: "3:45", l: "Xà phòng hóa" }, { t: "5:20", l: "Lipid và tổng kết" }].map((part) => <button key={part.t} onClick={() => seek(Number(part.t.split(":")[0]) * 60 + Number(part.t.split(":")[1]))} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50"><span className="font-mono text-xs text-indigo-600">{part.t}</span><span className="text-xs text-slate-600">{part.l}</span></button>)}</div></div>
        </aside>
      </section>

      <div id="practice" className="border-t border-slate-200 bg-white/40">
        {videoComplete ? <AIPracticeGrading onPassed={() => setLessonPassed(true)} /> : <div className="mx-auto max-w-5xl px-4 py-12 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><LockKeyhole className="h-6 w-6" /></span><h2 className="mt-4 text-lg font-black text-slate-700">Luyện tập cuối bài đang khóa</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">Hoàn thành video và trả lời đúng các câu hỏi giữa bài để mở khóa phần luyện tập tổng hợp.</p></div>}
      </div>

      {lessonPassed && <div className="mx-auto mb-10 max-w-5xl px-4"><div className="flex flex-col items-center justify-between gap-4 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 sm:flex-row"><div className="flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-emerald-500" /><div><p className="text-sm font-black text-emerald-800">Bài Ester và Lipid đã hoàn thành</p><p className="text-xs text-emerald-600">“Carbohydrate” đã được mở khóa trong lộ trình Hóa 12.</p></div></div><button onClick={() => setView("dashboard")} className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white">Xem lộ trình đã cập nhật</button></div></div>}

      <FloatingNotebookWidget />
    </main>
  );
}
