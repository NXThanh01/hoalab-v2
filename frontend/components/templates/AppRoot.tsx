"use client";

import { useState } from "react";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { LoginView } from "@/frontend/features/auth/components/LoginView";
import { ChangePasswordView } from "@/frontend/features/auth/components/ChangePasswordView";
import { AdminPortalShell } from "@/frontend/features/admin/components/AdminPortalShell";
import { LearningProvider } from "@/frontend/features/learning/model/LearningContext";
import type { LearningView } from "@/shared/auth-input";
import { AppShell } from "./AppShell";

export function AppRoot({ initialView }: { initialView: LearningView }) {
  const { user, isAdmin, logoutError } = useAuth();
  const [passwordEditor, setPasswordEditor] = useState(false);

  if (!user) return <LoginView />;
  if (user.mustChangePassword || passwordEditor) {
    return <ChangePasswordView forced={user.mustChangePassword} onClose={() => setPasswordEditor(false)} />;
  }
  if (isAdmin) return <AdminPortalShell key={user.userId} onChangePassword={() => setPasswordEditor(true)} />;

  return <LearningProvider key={user.userId} initialView={initialView}>
    {logoutError && <p role="alert" className="bg-rose-50 p-3 text-center text-sm text-rose-700">{logoutError}</p>}
    <AppShell />
  </LearningProvider>;
}
