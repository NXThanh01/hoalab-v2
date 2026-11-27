"use client";

import { useEffect, useState } from "react";

export function useFirstVisitGuide(userId: string | undefined, role: "student" | "admin") {
  const [open, setOpen] = useState(false);
  const key = userId ? `hoalab:onboarding:v1:${role}:${userId}` : null;

  useEffect(() => {
    if (!key) return;
    const timer = window.setTimeout(() => {
      try {
        if (localStorage.getItem(key) === "seen") return;
      } catch {
        // The guide can still be used when browser storage is unavailable.
      }
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);

  function dismiss() {
    setOpen(false);
    if (!key) return;
    try {
      localStorage.setItem(key, "seen");
    } catch {
      // Dismissing still closes the guide for this visit.
    }
  }

  return { open, show: () => setOpen(true), dismiss };
}
