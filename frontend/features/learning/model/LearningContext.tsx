"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { getCloudProgress, saveCloudProgress } from "@/frontend/features/progress/services/progress.service";

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

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AppView>("dashboard");
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [unlockedLesson, setUnlockedLesson] = useState(1);
  const [bestScore, setBestScore] = useState(0);
  const [syncState, setSyncState] = useState<"local" | "syncing" | "synced" | "error">("local");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    const restoreProgress = window.setTimeout(() => {
      const saved = localStorage.getItem(LEARNING_STORAGE_KEY);
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as {
          completedLessons: number[];
          unlockedLesson: number;
          bestScore: number;
        };
        setCompletedLessons(parsed.completedLessons ?? []);
        setUnlockedLesson(parsed.unlockedLesson ?? 1);
        setBestScore(parsed.bestScore ?? 0);
      } catch {
        localStorage.removeItem(LEARNING_STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(restoreProgress);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify({ completedLessons, unlockedLesson, bestScore }),
    );
  }, [bestScore, completedLessons, unlockedLesson]);

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
    [bestScore, completedLessons, isAuthenticated, lastSyncedAt, syncNow, syncState, unlockedLesson, view],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("useLearning must be used inside LearningProvider");
  return value;
}
