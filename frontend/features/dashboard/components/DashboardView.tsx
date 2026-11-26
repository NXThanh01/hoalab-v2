"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Beaker,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  FlaskConical,
  Library,
  LockKeyhole,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import { useLearning, type AppView } from "@/frontend/features/learning/model/LearningContext";

type VideoLesson = {
  id: string;
  eyebrow: string;
  title: string;
  duration: string;
  checkpoints: number;
  progress: number;
  formula: string;
  tone: "blue" | "cyan" | "amber" | "slate";
  locked?: boolean;
};

const videoLessons: VideoLesson[] = [
  {
    id: "01",
    eyebrow: "Ester và Lipid · Bài 3",
    title: "Phản ứng xà phòng hóa ester",
    duration: "18 phút",
    checkpoints: 3,
    progress: 42,
    formula: "RCOOR′ + NaOH → RCOONa + R′OH",
    tone: "blue",
  },
  {
    id: "02",
    eyebrow: "Ester và Lipid · Bài 4",
    title: "Chất béo và phản ứng hydrogen hóa",
    duration: "16 phút",
    checkpoints: 2,
    progress: 0,
    formula: "(RCOO)₃C₃H₅ + 3H₂",
    tone: "cyan",
  },
  {
    id: "03",
    eyebrow: "Carbohydrate · Bài 1",
    title: "Glucose và phản ứng tráng bạc",
    duration: "21 phút",
    checkpoints: 4,
    progress: 0,
    formula: "C₆H₁₂O₆ + 2[Ag(NH₃)₂]OH",
    tone: "amber",
  },
  {
    id: "04",
    eyebrow: "Carbohydrate · Bài 2",
    title: "Saccharose, tinh bột và cellulose",
    duration: "19 phút",
    checkpoints: 3,
    progress: 0,
    formula: "(C₆H₁₀O₅)ₙ + nH₂O",
    tone: "slate",
    locked: true,
  },
];

const studyPlan = [
  { title: "Xem hết bài xà phòng hóa", meta: "Còn khoảng 10 phút", view: "lesson" as AppView, done: false },
  { title: "Làm 10 câu Ester và Lipid", meta: "Mục tiêu 8/10", view: "practice" as AppView, done: false },
  { title: "Thí nghiệm trùng ngưng nylon-6,6", meta: "Đã hoàn thành", view: "lab" as AppView, done: true },
];

const toneStyles: Record<VideoLesson["tone"], string> = {
  blue: "bg-[#e9f0ff] text-[#1648a5]",
  cyan: "bg-[#e4f7f6] text-[#0d6463]",
  amber: "bg-[#fff2d7] text-[#8b4b09]",
  slate: "bg-[#e9edf2] text-[#344256]",
};

export function DashboardView() {
  const { goToLesson, setView } = useLearning();
  const today = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  function open(view: AppView) {
    if (view === "lesson") goToLesson();
    else setView(view);
  }

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f5f6f8] px-4 pb-16 pt-5 sm:px-6 sm:pt-7 lg:ml-[232px] lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.2, 0, 0, 1] }}
          className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium capitalize text-slate-500">{today}</p>
            <h1 className="mt-1 max-w-3xl text-[1.75rem] font-semibold leading-[1.18] tracking-[-0.035em] text-[#182131] sm:text-[2.35rem]">
              Bàn học Hóa 12 của Minh Anh
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setView("courses")}
            className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm active:translate-y-0 sm:w-auto"
          >
            <Library className="h-[18px] w-[18px]" />
            Mở kho tài liệu
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </motion.header>

        <section className="mt-5 grid gap-4 lg:grid-cols-12">
          <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.42, ease: [0.2, 0, 0, 1] }}
            className="relative overflow-hidden rounded-[1.5rem] bg-[#142033] text-white shadow-[0_18px_50px_rgba(20,32,51,0.14)] lg:col-span-8"
          >
            <div className="grid min-h-[350px] md:grid-cols-[1.08fr_.92fr]">
              <div className="relative z-10 flex flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-[#a9c5ff]">
                    <span className="h-2 w-2 rounded-full bg-[#55d6c2]" />
                    Bài đang học
                  </div>
                  <h2 className="mt-5 max-w-xl text-[1.8rem] font-semibold leading-[1.12] tracking-[-0.035em] sm:text-[2.4rem]">
                    Phản ứng xà phòng hóa ester
                  </h2>
                  <p className="mt-3 max-w-lg text-base leading-7 text-slate-300">
                    Video 18 phút với 3 câu hỏi xuất hiện đúng lúc bạn vừa học xong khái niệm.
                  </p>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Bài 3 trên 7</span>
                    <span className="font-medium text-white">42%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full w-[42%] rounded-full bg-[#78a4ff]" />
                  </div>
                  <button
                    type="button"
                    onClick={goToLesson}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2f6ee5] px-5 text-base font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#285fca] hover:shadow-[0_10px_24px_rgba(47,110,229,0.3)] active:translate-y-0 sm:w-auto"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Tiếp tục bài học
                  </button>
                </div>
              </div>

              <div className="relative min-h-[220px] overflow-hidden border-t border-white/10 bg-[#0d1728] md:min-h-full md:border-l md:border-t-0">
                <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:32px_32px]" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-[320px] rotate-[-2deg] rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-sm transition-transform duration-300 hover:rotate-0">
                    <p className="font-serif text-xl text-[#dce8ff]">RCOOR′ + NaOH</p>
                    <div className="my-5 flex items-center gap-2" aria-hidden="true">
                      <span className="h-3 w-3 rounded-full bg-[#78a4ff]" />
                      <span className="h-px flex-1 bg-white/20" />
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-[#55d6c2]/50 text-xs text-[#55d6c2]">t°</span>
                      <span className="h-px flex-1 bg-white/20" />
                      <span className="h-3 w-3 rounded-full bg-[#55d6c2]" />
                    </div>
                    <p className="text-right font-serif text-xl text-[#b9f3e8]">RCOONa + R′OH</p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                      <span>Checkpoint 2:15</span>
                      <span className="rounded-md bg-[#55d6c2]/10 px-2 py-1 text-[#70dfcc]">Đã trả lời</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>

          <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)] sm:p-6 lg:col-span-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Mục tiêu tuần</p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-slate-950">Còn 2 hoạt động</h2>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[5px] border-[#dce8ff] border-r-[#2f6ee5] border-t-[#2f6ee5] text-sm font-semibold text-slate-800">67</span>
            </div>
            <div className="mt-6 space-y-1">
              {studyPlan.map((item) => (
                <button key={item.title} type="button" onClick={() => open(item.view)} className="group flex min-h-[68px] w-full items-center gap-3 rounded-xl px-2 text-left transition hover:bg-slate-50 active:bg-slate-100">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${item.done ? "bg-[#e3f6f1] text-[#087765]" : "border border-slate-200 text-slate-400"}`}>
                    {item.done ? <Check className="h-4 w-4" /> : <CirclePlay className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1"><span className={`block text-sm font-medium ${item.done ? "text-slate-500" : "text-slate-900"}`}>{item.title}</span><span className="mt-0.5 block text-xs text-slate-500">{item.meta}</span></span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-slate-500"><Target className="h-4 w-4" /> Chuỗi học</span><strong className="font-semibold text-slate-900">6 ngày</strong></div>
            </div>
          </aside>
        </section>

        <section className="mt-10" aria-labelledby="interactive-videos-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#255fc4]">Hóa học 12</p>
              <h2 id="interactive-videos-heading" className="mt-1 text-[1.65rem] font-semibold tracking-[-0.035em] text-[#182131] sm:text-[2rem]">Video tương tác tiếp theo</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">Mỗi video tự dừng ở các checkpoint. Trả lời đúng để xem tiếp và lưu tiến độ.</p>
            </div>
            <button type="button" onClick={() => setView("courses")} className="group inline-flex min-h-11 self-start items-center gap-2 text-sm font-medium text-[#255fc4] sm:self-auto">Xem danh sách bài<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {videoLessons.map((video) => (
              <motion.button
                key={video.id}
                type="button"
                onClick={video.locked ? undefined : goToLesson}
                whileHover={video.locked ? undefined : { y: -2 }}
                whileTap={video.locked ? undefined : { y: 0 }}
                transition={{ duration: 0.18 }}
                className={`group overflow-hidden rounded-[1.25rem] border bg-white text-left shadow-[0_8px_30px_rgba(15,23,42,.055)] transition duration-200 ${video.locked ? "cursor-not-allowed border-slate-200 opacity-70" : "border-slate-200 hover:border-slate-300 hover:shadow-[0_14px_38px_rgba(15,23,42,.09)]"}`}
                aria-label={video.locked ? `${video.title} đang khóa` : `Mở video ${video.title}`}
              >
                <span className={`relative flex aspect-[16/9] items-center justify-center overflow-hidden p-5 ${toneStyles[video.tone]}`}>
                  <span className="absolute left-4 top-4 text-xs font-medium opacity-70">{video.id}</span>
                  <span className="max-w-[90%] text-center font-serif text-lg leading-7 tracking-wide">{video.formula}</span>
                  <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,.12)] transition-transform duration-200 group-hover:scale-105">{video.locked ? <LockKeyhole className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}</span>
                </span>
                <span className="block p-5">
                  <span className="block text-xs font-medium text-slate-500">{video.eyebrow}</span>
                  <span className="mt-2 block min-h-12 text-base font-semibold leading-6 tracking-[-0.015em] text-slate-950">{video.title}</span>
                  <span className="mt-4 flex items-center gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {video.duration}</span><span>{video.checkpoints} checkpoint</span></span>
                  <span className="mt-4 block h-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-[#2f6ee5]" style={{ width: `${video.progress}%` }} /></span>
                  <span className="mt-2 flex items-center justify-between text-xs"><span className="text-slate-400">{video.locked ? "Hoàn thành bài trước để mở" : video.progress ? "Đang học" : "Chưa bắt đầu"}</span>{!video.locked && <span className="font-medium text-slate-600">{video.progress}%</span>}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-12">
          <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Chuyên đề đang học</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-slate-950">Ester và Lipid</h2></div><span className="rounded-lg bg-[#e9f0ff] px-3 py-1.5 text-sm font-medium text-[#255fc4]">3/7 bài</span></div>
            <div className="mt-6 space-y-4">
              {["Khái niệm và danh pháp ester", "Tính chất hóa học của ester", "Phản ứng xà phòng hóa", "Chất béo và ứng dụng"].map((title, index) => (
                <button key={title} type="button" onClick={index < 3 ? goToLesson : undefined} className="group flex min-h-12 w-full items-center gap-3 text-left">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-medium ${index < 2 ? "bg-[#e3f6f1] text-[#087765]" : index === 2 ? "bg-[#2f6ee5] text-white" : "bg-slate-100 text-slate-500"}`}>{index < 2 ? <Check className="h-4 w-4" /> : index + 1}</span>
                  <span className={`flex-1 text-sm font-medium ${index === 2 ? "text-slate-950" : "text-slate-600"}`}>{title}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[1.5rem] bg-[#e6f5f1] p-6 lg:col-span-5">
            <div className="relative z-10 max-w-md"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#087765] shadow-sm"><FlaskConical className="h-5 w-5" /></span><p className="mt-6 text-sm font-medium text-[#087765]">Phòng thí nghiệm</p><h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#142c2a]">Trùng ngưng nylon-6,6</h2><p className="mt-3 text-base leading-7 text-[#456763]">Điều chỉnh nhiệt độ và tỉ lệ monomer để quan sát mạch polymer hình thành.</p><button type="button" onClick={() => setView("lab")} className="group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0b7565] px-4 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#075e52] active:translate-y-0 sm:w-auto"><Beaker className="h-4 w-4" />Mở thí nghiệm</button></div>
            <div className="pointer-events-none absolute -bottom-12 -right-14 h-48 w-48 rounded-full border-[22px] border-white/55" /><div className="pointer-events-none absolute bottom-12 right-12 h-7 w-7 rounded-full bg-[#64c7b6]" />
          </article>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => setView("practice")} className="group flex min-h-28 items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm active:translate-y-0"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff2d7] text-[#8b4b09]"><BookOpen className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-500">10 câu · 12 phút</span><span className="mt-1 block text-lg font-semibold text-slate-950">Luyện tập Ester và Lipid</span></span><ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" /></button>
          <button type="button" onClick={() => setView("ai")} className="group flex min-h-28 items-center gap-4 rounded-[1.25rem] border border-slate-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm active:translate-y-0"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e9f0ff] text-[#255fc4]"><Bot className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-center gap-1.5 text-sm font-medium text-slate-500"><Sparkles className="h-3.5 w-3.5" /> Trợ lý Hóa</span><span className="mt-1 block text-lg font-semibold text-slate-950">Hỏi cách giải từng bước</span></span><ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1" /></button>
        </section>
      </div>
    </main>
  );
}
