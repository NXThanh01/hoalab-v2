"use client";

import { Beaker, CalendarDays, ShieldCheck } from "lucide-react";
import { navigationItems } from "@/frontend/features/dashboard/data/dashboard.data";
import { useLearning } from "@/frontend/features/learning/model/LearningContext";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";

export function AppSidebar() {
  const { setView, view } = useLearning();
  const { isAdmin } = useAuth();

  return (
    <aside className="sidebar-shell fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col overflow-hidden border-r border-slate-800 bg-[#111827] px-4 py-5 text-white lg:flex">
      <button
        className="flex items-center gap-3 px-2 text-left"
        onClick={() => setView("dashboard")}
        aria-label="Về trang chủ HóaLab"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500">
          <Beaker className="h-6 w-6" />
        </span>
        <span>
          <span className="block text-lg font-extrabold tracking-tight">HóaLab</span>
          <span className="block text-xs text-slate-400">Tự học Hóa THPT</span>
        </span>
      </button>

      <div className="mt-8 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Học tập</div>
      <nav className="mt-3 flex-1 space-y-1" aria-label="Điều hướng chính">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = view === item.view || (view === "lesson" && item.view === "courses");
          return (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-blue-500 font-semibold text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {isAdmin && (
        <button
          type="button"
          onClick={() => setView("admin")}
          className={`mb-4 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${view === "admin" ? "border-blue-400/30 bg-blue-500/20 text-white" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
        >
          <ShieldCheck className="h-[18px] w-[18px]" />
          <span>Quản trị nội dung</span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-blue-300">Admin</span>
        </button>
      )}
      <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><CalendarDays className="h-4 w-4 text-blue-300" /> Mục tiêu tuần</div>
        <div className="mt-3 flex items-end justify-between"><span className="text-2xl font-extrabold">4/6</span><span className="text-xs text-slate-400">hoạt động</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-2/3 rounded-full bg-blue-400" /></div>
      </div>
      <p className="mt-4 px-2 text-xs text-slate-500">Hóa 12 · Năm học 2026–2027</p>
    </aside>
  );
}
