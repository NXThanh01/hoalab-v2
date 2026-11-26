"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Beaker, Bot, Calculator, Check, Cloud, CloudOff, FlaskConical, GraduationCap, LoaderCircle, LogOut, Menu, Search, ShieldCheck, X } from "lucide-react";
import { useLearning, type AppView } from "@/frontend/features/learning/model/LearningContext";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { navigationItems } from "@/frontend/features/dashboard/data/dashboard.data";

const searchItems: Array<{ label: string; detail: string; view: AppView; icon: typeof Search }> = [
  { label: "Ester và Lipid", detail: "Bài học trọng tâm Hóa 12", view: "lesson", icon: GraduationCap },
  { label: "Trợ lý AI Hóa học", detail: "Giải bài và cân bằng PTHH", view: "ai", icon: Bot },
  { label: "Bảng tuần hoàn", detail: "Tra cứu nguyên tố", view: "tools", icon: Beaker },
  { label: "Máy tính mol", detail: "Tính nồng độ dung dịch", view: "tools", icon: Calculator },
  { label: "Thí nghiệm ảo", detail: "Mô phỏng phản ứng", view: "lab", icon: FlaskConical },
];

export function AppHeader() {
  const { setView, syncState } = useLearning();
  const { user, isAdmin, loading, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const results = useMemo(() => searchItems.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase())), [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        document.getElementById("global-search")?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function choose(view: AppView) {
    setView(view);
    setQuery("");
    setSearchOpen(false);
  }

  const displayName = user?.displayName ?? "Khách học thử";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]?.toUpperCase()).join("") || "HL";
  const SyncIcon = syncState === "syncing" ? LoaderCircle : syncState === "synced" ? Check : syncState === "error" ? CloudOff : Cloud;

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-lg sm:px-6 lg:ml-[232px] lg:px-7">
      <button
        className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white lg:hidden"
        aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
        onClick={() => setMobileMenuOpen((value) => !value)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <button
        className="mr-auto flex items-center gap-2 text-slate-900 lg:hidden"
        onClick={() => setView("dashboard")}
      >
        <Beaker className="h-5 w-5 text-blue-600" />
        <span className="font-black">HóaLab</span>
      </button>

      <label className="relative hidden w-full max-w-xl md:block">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="global-search"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
          onKeyDown={(event) => { if (event.key === "Enter" && results[0]) choose(results[0].view); }}
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          placeholder="Tìm kiếm bài học, khái niệm, công thức..."
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-xs text-slate-400">⌘ K</span>
        {searchOpen && <div className="absolute left-0 right-0 top-[48px] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{results.length ? results.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item.view)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-slate-50"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-4 w-4" /></span><span><span className="block text-sm font-semibold text-slate-700">{item.label}</span><span className="block text-xs text-slate-400">{item.detail}</span></span></button>; }) : <p className="px-4 py-6 text-center text-sm text-slate-400">Không tìm thấy nội dung phù hợp.</p>}</div>}
      </label>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        {user && (
          <div className={`hidden items-center gap-1.5 text-xs font-semibold md:flex ${syncState === "error" ? "text-rose-600" : "text-emerald-700"}`} title="Trạng thái đồng bộ tiến trình">
            <SyncIcon className={`h-3.5 w-3.5 ${syncState === "syncing" ? "animate-spin" : ""}`} />
            {syncState === "syncing" ? "Đang lưu" : syncState === "error" ? "Chưa đồng bộ" : "Đã đồng bộ"}
          </div>
        )}
        {isAdmin && <button type="button" aria-label="Mở Admin Studio" onClick={() => setView("admin")} className="hidden h-10 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:flex"><ShieldCheck className="h-4 w-4" /> <span className="hidden xl:inline">Admin Studio</span></button>}
        <button className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>
        <div className="hidden h-7 w-px bg-slate-200 sm:block" />
        {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-blue-500" /> : user && <><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{initials}</div><div className="hidden sm:block"><p className="max-w-40 truncate text-sm font-semibold text-slate-800">{displayName}</p><p className="text-xs text-slate-500">Lớp {user.gradeLevel}</p></div></div><button type="button" onClick={() => void logout()} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500" aria-label="Đăng xuất"><LogOut className="h-4 w-4" /></button></>}
      </div>
      {mobileMenuOpen && <div className="absolute left-4 right-4 top-[68px] z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl lg:hidden"><p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Điều hướng HóaLab</p><div className="grid gap-1 sm:grid-cols-2">{navigationItems.map((item) => { const Icon = item.icon; return <button type="button" key={item.label} onClick={() => { setView(item.view); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100"><Icon className="h-4 w-4" /></span>{item.label}</button>; })}{isAdmin && <button type="button" onClick={() => { setView("admin"); setMobileMenuOpen(false); }} className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-left text-sm font-bold text-blue-700"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white"><ShieldCheck className="h-4 w-4" /></span>Admin Studio</button>}</div></div>}
    </header>
  );
}
