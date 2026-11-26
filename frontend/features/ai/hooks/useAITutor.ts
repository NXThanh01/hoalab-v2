"use client";

import { useEffect, useState } from "react";
import { aiWelcomeMessage } from "@/frontend/features/ai/data/ai.data";
import { askChemistryAI } from "@/frontend/features/ai/services/ai-chat.service";
import type { AIMode, AIMessage } from "@/frontend/features/ai/model/ai.types";

const HISTORY_KEY = "hoalab-ai-history-v1";

const welcome: AIMessage = {
  id: "welcome",
  role: "assistant",
  content: aiWelcomeMessage,
  createdAt: Date.now(),
};

export function useAITutor() {
  const [messages, setMessages] = useState<AIMessage[]>([welcome]);
  const [mode, setMode] = useState<AIMode>("explain");
  const [busy, setBusy] = useState(false);
  const [engine, setEngine] = useState<"openai" | "mock">("mock");

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { setMessages(JSON.parse(saved) as AIMessage[]); } catch { localStorage.removeItem(HISTORY_KEY); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  async function send(content: string) {
    const clean = content.trim();
    if (!clean || busy) return;
    const userMessage: AIMessage = { id: crypto.randomUUID(), role: "user", content: clean, createdAt: Date.now() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setBusy(true);
    try {
      const result = await askChemistryAI(nextMessages, mode);
      setEngine(result.model);
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: result.answer, createdAt: Date.now() }]);
    } catch (error) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content: error instanceof Error ? error.message : "Không thể kết nối AI.", createdAt: Date.now() }]);
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setMessages([{ ...welcome, createdAt: Date.now() }]);
  }

  return { busy, clear, engine, messages, mode, send, setMode };
}
