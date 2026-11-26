"use client";

import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { LoginView } from "@/frontend/features/auth/components/LoginView";
import { LearningProvider } from "@/frontend/features/learning/model/LearningContext";
import { AppShell } from "./AppShell";

export function AppRoot() {
  const { user, loading } = useAuth();

  if (loading && !user) {
    return <div className="grid min-h-screen place-items-center bg-slate-950 text-white"><div className="text-center"><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" /><p className="mt-4 text-sm font-bold text-slate-300">Đang mở HóaLab...</p></div></div>;
  }

  if (!user) return <LoginView />;

  return <LearningProvider><AppShell /></LearningProvider>;
}
