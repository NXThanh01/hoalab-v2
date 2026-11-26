"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Award, Clock3, EyeOff, Search, ShieldCheck, Trophy } from "lucide-react";
import { useAdminStudio } from "../hooks/useAdminStudio";

type Studio = ReturnType<typeof useAdminStudio>;

function duration(seconds: number) {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}p ${seconds % 60}s`;
}

export function AttemptMonitor({ studio }: { studio: Studio }) {
  const [query, setQuery] = useState("");
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const attempts = useMemo(() => studio.attempts.filter((item) => {
    const match = `${item.studentName} ${item.studentEmail} ${item.examTitle}`.toLowerCase().includes(query.toLowerCase());
    const flagged = item.tabSwitches + item.fullscreenExits > 0;
    return match && (!onlyFlagged || flagged);
  }), [onlyFlagged, query, studio.attempts]);
  const average = studio.attempts.length ? studio.attempts.reduce((sum, item) => sum + item.score, 0) / studio.attempts.length : 0;
  const passRate = studio.attempts.length ? (studio.attempts.filter((item) => item.passed).length / studio.attempts.length) * 100 : 0;
  const flaggedCount = studio.attempts.filter((item) => item.tabSwitches + item.fullscreenExits > 0).length;

  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Lượt thi" value={studio.attempts.length.toString()} icon={Trophy} tone="bg-indigo-50 text-indigo-600" /><Metric label="Điểm trung bình" value={average.toFixed(1)} icon={Award} tone="bg-emerald-50 text-emerald-600" /><Metric label="Tỷ lệ đạt" value={`${passRate.toFixed(0)}%`} icon={ShieldCheck} tone="bg-sky-50 text-sky-600" /><Metric label="Cần xem lại" value={flaggedCount.toString()} icon={AlertTriangle} tone="bg-amber-50 text-amber-600" /></div>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Exam analytics</p><h2 className="mt-1 text-2xl font-black">Theo dõi lượt thi</h2><p className="mt-1 text-sm text-slate-500">Điểm số và tín hiệu rời tab/toàn màn hình được ghi nhận riêng, không tự động trừ điểm.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none" placeholder="Tìm học sinh hoặc đề..." /></label><button type="button" onClick={() => setOnlyFlagged((value) => !value)} className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold ${onlyFlagged ? "bg-amber-500 text-white" : "border border-slate-200 text-slate-600"}`}><EyeOff className="h-4 w-4" /> Có cảnh báo</button></div></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400"><th className="px-3 py-3">Học sinh</th><th className="px-3 py-3">Kỳ thi</th><th className="px-3 py-3">Điểm</th><th className="px-3 py-3">Thời gian</th><th className="px-3 py-3">Rời tab</th><th className="px-3 py-3">Thoát toàn màn hình</th><th className="px-3 py-3">Nộp lúc</th></tr></thead><tbody>{attempts.map((item) => { const flagged = item.tabSwitches + item.fullscreenExits > 0; return <tr key={item.id} className="border-b border-slate-100 text-sm"><td className="px-3 py-4"><p className="font-bold text-slate-800">{item.studentName}</p><p className="mt-1 text-xs text-slate-400">{item.studentEmail}</p></td><td className="max-w-xs px-3 py-4 font-semibold text-slate-600">{item.examTitle}</td><td className="px-3 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-black ${item.passed ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{item.score}/10</span></td><td className="px-3 py-4 text-slate-500"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {duration(item.elapsedSeconds)}</span></td><td className="px-3 py-4 font-bold text-slate-600">{item.tabSwitches}</td><td className="px-3 py-4 font-bold text-slate-600">{item.fullscreenExits}</td><td className="px-3 py-4 text-xs text-slate-400">{item.submittedAt ? new Date(item.submittedAt).toLocaleString("vi-VN") : "—"}{flagged && <span className="ml-2 inline-flex rounded-full bg-amber-50 px-2 py-1 font-bold text-amber-700">Kiểm tra</span>}</td></tr>; })}</tbody></table>{!attempts.length && <div className="py-12 text-center text-sm text-slate-400">Chưa có lượt thi phù hợp.</div>}</div>
    </section>
  </div>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Trophy; tone: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm font-medium text-slate-500">{label}</p></div>; }
