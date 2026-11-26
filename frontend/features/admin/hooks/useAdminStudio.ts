"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminOverview, AttemptRecord, ExamFolderRecord, ExamRecord, LessonContentRecord, QuestionRecord } from "../model/admin.types";

type LoadState = "loading" | "ready" | "error";

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "REQUEST_FAILED");
  return data;
}

export function useAdminStudio() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [lessons, setLessons] = useState<LessonContentRecord[]>([]);
  const [folders, setFolders] = useState<ExamFolderRecord[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [mutating, setMutating] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setState("loading");
    try {
      const [overviewResponse, questionsResponse, examsResponse, attemptsResponse, lessonsResponse, foldersResponse] = await Promise.all([
        fetch("/api/admin/overview", { cache: "no-store" }),
        fetch("/api/admin/questions", { cache: "no-store" }),
        fetch("/api/admin/exams", { cache: "no-store" }),
        fetch("/api/admin/attempts", { cache: "no-store" }),
        fetch("/api/admin/lessons", { cache: "no-store" }),
        fetch("/api/admin/exam-folders", { cache: "no-store" }),
      ]);
      const [overviewData, questionsData, examsData, attemptsData, lessonsData, foldersData] = await Promise.all([
        readJson<{ overview: AdminOverview }>(overviewResponse),
        readJson<{ questions: QuestionRecord[] }>(questionsResponse),
        readJson<{ exams: ExamRecord[] }>(examsResponse),
        readJson<{ attempts: AttemptRecord[] }>(attemptsResponse),
        readJson<{ lessons: LessonContentRecord[] }>(lessonsResponse),
        readJson<{ folders: ExamFolderRecord[] }>(foldersResponse),
      ]);
      setOverview(overviewData.overview);
      setQuestions(questionsData.questions);
      setExams(examsData.exams);
      setAttempts(attemptsData.attempts);
      setLessons(lessonsData.lessons);
      setFolders(foldersData.folders);
      setLastSyncedAt(new Date().toISOString());
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(true), 15_000);
    const onFocus = () => void refresh(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const mutate = useCallback(async (url: string, method: "POST" | "PATCH" | "DELETE", body: unknown) => {
    setMutating(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await readJson<Record<string, unknown>>(response);
      await refresh(true);
      return result;
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  return {
    overview,
    questions,
    exams,
    attempts,
    lessons,
    folders,
    state,
    mutating,
    lastSyncedAt,
    refresh,
    createQuestion: (body: unknown) => mutate("/api/admin/questions", "POST", body),
    updateQuestion: (body: unknown) => mutate("/api/admin/questions", "PATCH", body),
    deleteQuestion: (id: string) => mutate("/api/admin/questions", "DELETE", { id }),
    importQuestions: (questionsToImport: unknown[]) => mutate("/api/admin/questions", "POST", { questions: questionsToImport }),
    createExam: (body: unknown) => mutate("/api/admin/exams", "POST", body),
    updateExam: (body: unknown) => mutate("/api/admin/exams", "PATCH", body),
    updateExamStatus: (id: string, status: ExamRecord["status"]) => mutate("/api/admin/exams", "PATCH", { id, status }),
    seedGrade12: () => mutate("/api/admin/seed-grade12", "POST", {}),
    saveLesson: (body: unknown) => mutate("/api/admin/lessons", "POST", body),
    createFolder: (body: unknown) => mutate("/api/admin/exam-folders", "POST", body),
    updateFolder: (body: unknown) => mutate("/api/admin/exam-folders", "PATCH", body),
    deleteFolder: (id: string) => mutate("/api/admin/exam-folders", "DELETE", { id }),
  };
}
