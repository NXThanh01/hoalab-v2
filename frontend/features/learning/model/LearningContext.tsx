"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { getCloudProgress, saveCloudProgress } from "@/frontend/features/progress/services/progress.service";
import { safeLearningView, type LearningView } from "@/shared/auth-input";

export type AppView = "dashboard" | "lesson" | "ai" | "tools" | "courses" | "practice" | "lab" | "admin";

type LearningState = {
  view: AppView;
  setView: (view: AppView) => void;
  completedLessons: number[];
  unlockedLesson: number;
  bestScore: number;
  syncState: "local" | "syncing" | "synced" | "error";
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
  completeLesson: (lessonId: number, score: number) => void;
  goToLesson: () => void;
};

const LearningContext = createContext<LearningState | null>(null);

export const LEARNING_STORAGE_KEY = "hoalab-progress-grade12-v2";

export function LearningProvider({ children, initialView }: { children: React.ReactNode; initialView: LearningView }) {
  const { isAuthenticated, user } = useAuth();
  const storageKey = `${LEARNING_STORAGE_KEY}:${user?.userId ?? "unknown"}`;
  const [view, setScreen] = useState<AppView>(initialView);
  const [restored, setRestored] = useState(false);

  const setView = useCallback((next: AppView) => {
    const screen = safeLearningView(next);
    setScreen(screen);
    const url = new URL(window.location.href);
    url.searchParams.delete("adminTab");
    if (screen === "dashboard") url.searchParams.delete("view");
    else url.searchParams.set("view", screen);
    window.history.replaceState(null, "", url);
  }, []);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [unlockedLesson, setUnlockedLesson] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [syncState, setSyncState] = useState<"local" | "syncing" | "synced" | "error">("local");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const restoreProgress = window.setTimeout(() => {
      setScreen(safeLearningView(new URLSearchParams(window.location.search).get("view")));
      try {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;
        const parsed = JSON.parse(saved) as {
          completedLessons: number[];
          unlockedLesson: number;
          bestScore: number;
        };
        setCompletedLessons(parsed.completedLessons ?? []);
        setUnlockedLesson(parsed.unlockedLesson ?? 1);
        setBestScore(parsed.bestScore ?? 0);
      } catch {
        // Ignore invalid or unavailable browser storage.
      } finally {
        setRestored(true);
      }
    }, 0);
    return () => window.clearTimeout(restoreProgress);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ completedLessons, unlockedLesson, bestScore }));
    } catch {
      // Cloud sync is available when browser storage is disabled.
    }
  }, [bestScore, completedLessons, restored, storageKey, unlockedLesson]);

  const syncNow = useCallback(async () => {
    if (!isAuthenticated) {
      setSyncState("local");
      return;
    }
    setSyncState("syncing");
    try {
      const records = await getCloudProgress();
      if (records.length) {
        const completed = records.filter((item) => item.status === "completed").map((item) => item.lessonId);
        setCompletedLessons((current) => Array.from(new Set([...current, ...completed])));
        setUnlockedLesson((current) => Math.max(current, ...completed.map((id) => id + 1), 1));
        setBestScore((current) => Math.max(current, ...records.map((item) => item.bestScore), 0));
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncState("synced");
    } catch {
      setSyncState("error");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const initialSync = window.setTimeout(() => void syncNow(), 0);
    if (!isAuthenticated) return () => window.clearTimeout(initialSync);
    const interval = window.setInterval(() => void syncNow(), 30_000);
    const onFocus = () => void syncNow();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(initialSync);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [isAuthenticated, syncNow]);

  const value = useMemo(
    () => ({
      view,
      setView,
      completedLessons,
      unlockedLesson,
      bestScore,
      syncState,
      lastSyncedAt,
      syncNow,
      goToLesson: () => {
        setView("lesson");
        if (isAuthenticated) {
          setSyncState("syncing");
          void saveCloudProgress({ lessonId: 1, status: "in_progress", bestScore, videoSecond: 0, checkpoints: [] })
            .then(() => { setSyncState("synced"); setLastSyncedAt(new Date().toISOString()); })
            .catch(() => setSyncState("error"));
        }
      },
      completeLesson: (lessonId: number, score: number) => {
        setBestScore((current) => Math.max(current, score));
        setCompletedLessons((current) =>
          current.includes(lessonId) ? current : [...current, lessonId],
        );
        setUnlockedLesson((current) => Math.max(current, lessonId + 1));
        if (isAuthenticated) {
          setSyncState("syncing");
          void saveCloudProgress({ lessonId, status: "completed", bestScore: score, videoSecond: 0, checkpoints: [90, 225] })
            .then(() => { setSyncState("synced"); setLastSyncedAt(new Date().toISOString()); })
            .catch(() => setSyncState("error"));
        }
      },
    }),
    [bestScore, completedLessons, isAuthenticated, lastSyncedAt, setView, syncNow, syncState, unlockedLesson, view],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearning must be used inside LearningProvider");
  return value;
}
