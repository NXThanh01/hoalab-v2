"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, BarChart3, BookOpenCheck, CheckCircle2, CircleGauge, CloudUpload, DatabaseZap, FileQuestion, GraduationCap, LayoutDashboard, LoaderCircle, Plus, RefreshCw, Rocket, ShieldAlert, ShieldCheck, Sparkles, Users, Video } from "lucide-react";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { useAdminStudio } from "../hooks/useAdminStudio";
import { AttemptMonitor } from "./AttemptMonitor";
import { ExamManager } from "./ExamManager";
import { QuestionManager } from "./QuestionManager";
import { LessonContentManager } from "./LessonContentManager";
import { ExamLibraryManager } from "./ExamLibraryManager";

type AdminTab = "overview" | "lessons" | "questions" | "exams" | "attempts" | "import";
const tabs = [
  { id: "overview" as const, label: "Tổng quan", icon: LayoutDashboard },
  { id: "lessons" as const, label: "Bài giảng video", icon: Video },
  { id: "questions" as const, label: "Ngân hàng câu hỏi", icon: FileQuestion },
  { id: "exams" as const, label: "Kỳ thi", icon: GraduationCap },
  { id: "attempts" as const, label: "Lượt thi", icon: BarChart3 },
  { id: "import" as const, label: "Kho đề", icon: CloudUpload },
];

function formatTime(value: string | null) {
  return value ? new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)) : "Chưa đồng bộ";
}

export function AdminStudioView() {
  const { isAdmin, loading } = useAuth();
  const studio = useAdminStudio();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [seedNotice, setSeedNotice] = useState("");

  async function seedGrade12() {
    setSeedNotice("");
    try {
      const result = await studio.seedGrade12() as { questions?: number; exams?: number };
      setSeedNotice(`Đã đồng bộ ${result.questions ?? 15} câu hỏi và ${result.exams ?? 3} đề mẫu Hóa 12.`);
    } catch { setSeedNotice("Không thể nạp dữ liệu mẫu. Hãy thử lại."); }
  }

  if (loading || studio.state === "loading") return <AdminLoading />;
  if (!isAdmin) return <AdminDenied />;
  if (studio.state === "error") return <AdminError onRetry={() => void studio.refresh()} />;

  return <main className="min-h-[calc(100vh-72px)] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
    <section className="relative overflow-hidden rounded-[28px] bg-[#111827] px-6 py-7 text-white shadow-2xl shadow-slate-300/40 sm:px-8"><div className="absolute -right-10 -top-24 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" /><div className="absolute bottom-0 right-1/3 h-24 w-48 rounded-full bg-cyan-400/10 blur-2xl" /><div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end"><div><div className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-300"><ShieldCheck className="h-4 w-4" /> HóaLab Admin Studio</div><h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Điều hành nội dung, kỳ thi và kết quả học tập</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Soạn ngân hàng câu hỏi, xuất bản đề, theo dõi điểm và tín hiệu rời màn hình từ một bảng điều khiển.</p></div><div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={studio.mutating} onClick={() => void seedGrade12()} className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-xs font-black text-indigo-700 shadow-lg disabled:opacity-60">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />} Nạp demo Hóa 12</button><div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur"><span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" /></span><div><p className="text-xs font-bold">Đồng bộ thời gian thực</p><p className="text-[11px] text-slate-400">Lúc {formatTime(studio.lastSyncedAt)}</p></div><button type="button" onClick={() => void studio.refresh(true)} className="ml-2 grid h-8 w-8 place-items-center rounded-lg bg-white/10" aria-label="Làm mới"><RefreshCw className="h-4 w-4" /></button></div></div></div></section>
    {seedNotice && <div className="mt-4 flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700"><CheckCircle2 className="h-4 w-4" />{seedNotice}</div>}
    <nav className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === item.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav>
    <AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-6">{tab === "overview" && <Overview studio={studio} onNavigate={setTab} />}{tab === "lessons" && <LessonContentManager studio={studio} />}{tab === "questions" && <QuestionManager studio={studio} />}{tab === "exams" && <ExamManager studio={studio} />}{tab === "attempts" && <AttemptMonitor studio={studio} />}{tab === "import" && <ExamLibraryManager studio={studio} openExamBuilder={() => setTab("exams")} />}</motion.div></AnimatePresence>
  </main>;
}

function Overview({ studio, onNavigate }: { studio: ReturnType<typeof useAdminStudio>; onNavigate: (tab: AdminTab) => void }) {
  const overview = studio.overview;
  const cards = [
    { label: "Học sinh", value: overview?.students ?? 0, icon: Users, tone: "bg-sky-50 text-sky-600" },
    { label: "Bài giảng video", value: studio.lessons.length, icon: Video, tone: "bg-violet-50 text-violet-600" },
    { label: "Kỳ thi", value: overview?.exams ?? 0, icon: BookOpenCheck, tone: "bg-amber-50 text-amber-600" },
    { label: "Lượt làm bài", value: overview?.attempts ?? 0, icon: CircleGauge, tone: "bg-emerald-50 text-emerald-600" },
  ];
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}</div><div className="grid gap-4 sm:grid-cols-3"><Insight label="Điểm trung bình" value={`${overview?.averageScore ?? 0}/10`} icon={BarChart3} /><Insight label="Tỷ lệ đạt" value={`${overview?.passRate ?? 0}%`} icon={CheckCircle2} /><Insight label="Lượt cần xem lại" value={`${overview?.integrityFlags ?? 0}`} icon={ShieldAlert} /></div><div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Luồng vận hành</p><h2 className="mt-1 text-xl font-black">Thao tác nhanh</h2></div><Sparkles className="h-5 w-5 text-amber-400" /></div><div className="grid gap-3 sm:grid-cols-4">{[{ label: "Tạo câu hỏi", tab: "questions" as const, icon: Plus }, { label: "Nhập đề", tab: "import" as const, icon: CloudUpload }, { label: "Tạo kỳ thi", tab: "exams" as const, icon: Rocket }, { label: "Xem lượt thi", tab: "attempts" as const, icon: BarChart3 }].map(({ label, tab, icon: Icon }) => <button key={label} type="button" onClick={() => onNavigate(tab)} className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-indigo-200 hover:shadow-lg"><span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><Icon className="h-4 w-4" /></span><p className="text-sm font-bold">{label}</p></button>)}</div></section><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-600" /><h2 className="font-black">Hoạt động gần đây</h2></div><div className="space-y-3">{overview?.recentActivity.length ? overview.recentActivity.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-700">{item.action}</p><p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p></div></div>) : <p className="py-8 text-center text-sm text-slate-400">Chưa có hoạt động.</p>}</div></section></div></div>;
}

function Insight({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) { return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></span><div><p className="text-xl font-black">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div></div>; }
function AdminLoading() { return <main className="grid min-h-[calc(100vh-72px)] place-items-center"><div className="text-center"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600" /><p className="mt-3 text-sm font-bold text-slate-500">Đang mở Admin Studio...</p></div></main>; }
function AdminDenied() { return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-6"><div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><ShieldCheck className="mx-auto h-10 w-10 text-slate-300" /><h1 className="mt-5 text-2xl font-black">Khu vực dành cho quản trị viên</h1><p className="mt-3 text-sm text-slate-500">Tài khoản hiện tại không có quyền vận hành nội dung.</p></div></main>; }
function AdminError({ onRetry }: { onRetry: () => void }) { return <main className="grid min-h-[calc(100vh-72px)] place-items-center px-6"><div className="max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl"><Activity className="mx-auto h-10 w-10 text-rose-400" /><h1 className="mt-5 text-2xl font-black">Chưa kết nối được dữ liệu</h1><button onClick={onRetry} className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Thử lại</button></div></main>; }
