"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";
import { aiWelcomeMessage } from "@/frontend/features/ai/data/ai.data";
import { askChemistryAI } from "@/frontend/features/ai/services/ai-chat.service";
import type { AIMode, AIMessage } from "@/frontend/features/ai/model/ai.types";
import { CHAT_MAX_QUESTION } from "@/shared/chemistry-chat";

const welcome: AIMessage = { id: "welcome", role: "assistant", content: aiWelcomeMessage, createdAt: 0 };
const readHistory = (key: string): AIMessage[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    if (Array.isArray(saved)) {
      return [welcome, ...saved.filter((item): item is AIMessage => item && item.id !== welcome.id
        && typeof item.id === "string" && typeof item.content === "string"
        && ["user", "assistant"].includes(item.role)).slice(-40)];
    }
  } catch { /* The conversation still works with browser storage disabled. */ }
  return [welcome];
};

export function useAITutor() {
  const { user } = useAuth();
  const historyKey = `hoalab-ai-history-v2:${user?.userId ?? "guest"}`;
  const [hydratedKey, setHydratedKey] = useState("");
  const [messages, setMessages] = useState<AIMessage[]>([welcome]);
  const [mode, setMode] = useState<AIMode>("explain");
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<"gemini" | null>(null);
  const [error, setError] = useState("");
  const [truncated, setTruncated] = useState(false);
  const inFlight = useRef<AbortController | null>(null);
  const ready = hydratedKey === historyKey;

  useEffect(() => {
    const restore = window.setTimeout(() => {
      setMessages(readHistory(historyKey));
      setHydratedKey(historyKey);
    }, 0);
    return () => {
      window.clearTimeout(restore);
      inFlight.current?.abort();
      inFlight.current = null;
    };
  }, [historyKey]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(historyKey, JSON.stringify(messages.slice(-40))); }
    catch { /* Local history is optional. */ }
  }, [historyKey, messages, ready]);

  async function request(turns: AIMessage[]) {
    const controller = new AbortController();
    inFlight.current = controller;
    setBusy(true);
    setError("");
    setTruncated(false);
    try {
      const result = await askChemistryAI(turns, mode, controller.signal);
      if (controller.signal.aborted) return;
      setEngine(result.model);
      setTruncated(result.truncated);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: result.answer, createdAt: Date.now() }]);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Không thể kết nối AI.");
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setBusy(false);
      }
    }
  }

  function send(content: string) {
    const clean = content.trim();
    if (!ready || !clean || clean.length > CHAT_MAX_QUESTION || inFlight.current) return false;
    const userMessage: AIMessage = { id: crypto.randomUUID(), role: "user", content: clean, createdAt: Date.now() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    void request(nextMessages);
    return true;
  }

  function retry() {
    if (ready && !inFlight.current && messages.at(-1)?.role === "user") void request(messages);
  }

  function clear() {
    inFlight.current?.abort();
    inFlight.current = null;
    setBusy(false);
    setError("");
    setTruncated(false);
    setMessages([welcome]);
  }

  return { busy, clear, engine, error, messages: ready ? messages : [welcome], mode, ready, retry, send, setMode, truncated };
}
