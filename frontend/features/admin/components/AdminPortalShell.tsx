"use client";

import { Beaker, Database, LogOut, ShieldCheck } from "lucide-react";
import { AdminStudioView } from "./AdminStudioView";
import { FirstVisitGuide } from "@/frontend/features/onboarding/components/FirstVisitGuide";
import { GuideButton } from "@/frontend/features/onboarding/components/GuideButton";
import { useFirstVisitGuide } from "@/frontend/features/onboarding/model/useFirstVisitGuide";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";

export function AdminPortalShell({ onChangePassword }: { onChangePassword: () => void }) {
  const { user, logout, loading, logoutError } = useAuth();
  const guide = useFirstVisitGuide(user?.userId, "admin");

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <header className="sticky top-0 z-40 flex h-[72px] items-center gap-2 border-b sm:gap-4 border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><Beaker className="h-5 w-5" /></span><div><p className="font-black leading-none text-slate-900">HóaLab</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">Admin Portal</p></div></div>
        <div className="ml-auto hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:flex"><Database className="h-3.5 w-3.5" /> PostgreSQL connected</div>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="hidden text-right sm:block"><p className="text-xs font-bold text-slate-800">{user?.displayName}</p><p className="text-[10px] text-slate-400">Quản trị viên hệ thống</p></div>
        <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full lg:grid bg-indigo-50 text-indigo-600"><ShieldCheck className="h-4 w-4" /></span>
        <div className="ml-auto sm:ml-0"><GuideButton onClick={guide.show} /></div>
        <button type="button" onClick={onChangePassword} disabled={loading} className="min-h-11 shrink-0 rounded-xl border border-slate-200 px-2.5 text-sm font-medium text-slate-700 sm:px-3">Đổi mật khẩu</button>
        <button type="button" disabled={loading} onClick={() => void logout()} aria-label="Đăng xuất" className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Đăng xuất</span></button>
      </header>
      {logoutError && <p role="alert" className="bg-rose-50 p-3 text-center text-sm text-rose-700">{logoutError}</p>}
      <AdminStudioView />
      {guide.open && <FirstVisitGuide role="admin" onDismiss={guide.dismiss} />}
    </div>
  );
}
