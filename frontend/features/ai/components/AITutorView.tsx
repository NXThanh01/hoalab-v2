"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  ChevronRight,
  Clipboard,
  History,
  Lightbulb,
  LoaderCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";
import { aiModes, aiPromptSuggestions } from "@/frontend/features/ai/data/ai.data";
import { useAITutor } from "@/frontend/features/ai/hooks/useAITutor";

function MessageContent({ content }: { content: string }) {
  return <div className="space-y-2">{content.split("\n").filter(Boolean).map((line, index) => <p key={`${line}-${index}`} className="leading-6"><ChemicalNotation value={line} /></p>)}</div>;
}

export function AITutorView() {
  const { busy, clear, engine, messages, mode, send, setMode } = useAITutor();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const draft = sessionStorage.getItem("hoalab-ai-draft");
      if (draft) {
        setInput(draft);
        sessionStorage.removeItem("hoalab-ai-draft");
      }
    }, 0);
    return () => window.clearTimeout(restoreDraft);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [busy, messages]);

  const userQuestions = useMemo(() => messages.filter((message) => message.role === "user").length, [messages]);

  function sendCurrent() {
    if (!input.trim()) return;
    void send(input);
    setInput("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    sendCurrent();
  }

  async function copyMessage(id: string, content: string) {
    await navigator.clipboard.writeText(content.replaceAll("_", ""));
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f4f6fb] px-4 py-5 sm:px-6 lg:ml-[232px] lg:px-7">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[26px] bg-[#15133f] px-6 py-6 text-white shadow-xl shadow-indigo-950/10 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(124,58,237,.48),transparent_30%),radial-gradient(circle_at_60%_130%,rgba(14,165,233,.28),transparent_38%)]" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-indigo-950/30"><WandSparkles className="h-7 w-7" /></span>
              <div><div className="flex items-center gap-2"><h1 className="text-2xl font-black tracking-tight sm:text-3xl">AI Chemistry Copilot</h1><span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">Đang hoạt động</span></div><p className="mt-1 text-sm text-indigo-100/70">Hỏi sâu · Giải từng bước · Kiểm tra ký hiệu và phương trình</p></div>
            </div>
            <div className="flex gap-2"><div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-center"><p className="text-lg font-black">{userQuestions}</p><p className="text-xs text-indigo-200">Câu hỏi hôm nay</p></div><div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-center"><p className="text-sm font-black text-cyan-300">{engine === "openai" ? "OpenAI" : "Demo AI"}</p><p className="text-xs text-indigo-200">Bộ máy trả lời</p></div></div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_290px]">
          <aside className="order-2 space-y-4 xl:order-1">
            <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-sm font-black text-slate-800">Chế độ học</p><Sparkles className="h-4 w-4 text-violet-500" /></div>
              <div className="mt-3 space-y-2">{aiModes.map((item) => { const Icon = item.icon; const active = item.id === mode; return <button key={item.id} onClick={() => setMode(item.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm" : "border-transparent text-slate-600 hover:bg-slate-50"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-xs font-bold">{item.label}</span><span className="mt-0.5 block truncate text-xs opacity-65">{item.description}</span></span>{active && <Check className="ml-auto h-4 w-4" />}</button>; })}</div>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2"><History className="h-4 w-4 text-slate-400" /><p className="text-sm font-black text-slate-800">Phiên học hiện tại</p></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-black text-slate-800">{messages.length}</p><p className="text-xs text-slate-400">Tin nhắn</p></div><div className="rounded-xl bg-slate-50 p-3"><p className="text-lg font-black text-indigo-600">{mode === "explain" ? "Hiểu" : mode === "solve" ? "Giải" : mode === "balance" ? "PTHH" : "Quiz"}</p><p className="text-xs text-slate-400">Mục tiêu</p></div></div><button onClick={clear} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-100 py-2.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Xóa hội thoại</button></div>
          </aside>

          <div className="order-1 flex min-h-[650px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm xl:order-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><Bot className="h-5 w-5" /><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" /></span><div><p className="text-sm font-black text-slate-800">HóaLab AI</p><p className="text-xs text-slate-400">Đang ở chế độ {aiModes.find((item) => item.id === mode)?.label.toLowerCase()}</p></div></div><button onClick={clear} className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-indigo-600" aria-label="Tạo cuộc trò chuyện mới"><MessageSquarePlus className="h-5 w-5" /></button></div>

            <div className="flex-1 space-y-5 overflow-y-auto bg-[linear-gradient(180deg,#fff,#fafbff)] px-4 py-6 sm:px-6">
              <AnimatePresence initial={false}>{messages.map((message) => <motion.div key={message.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>{message.role === "assistant" && <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600"><Bot className="h-4 w-4" /></span>}<div className={`group max-w-[82%] rounded-[20px] px-4 py-3 text-sm ${message.role === "user" ? "rounded-tr-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100" : "rounded-tl-md border border-slate-200 bg-white text-slate-600 shadow-sm"}`}><MessageContent content={message.content} />{message.role === "assistant" && <button onClick={() => void copyMessage(message.id, message.content)} className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 opacity-0 transition group-hover:opacity-100">{copied === message.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Clipboard className="h-3 w-3" />}{copied === message.id ? "Đã sao chép" : "Sao chép"}</button>}</div></motion.div>)}</AnimatePresence>
              {busy && <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-100 text-indigo-600"><Bot className="h-4 w-4" /></span><div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin text-indigo-500" /> Đang phân tích kiến thức và kiểm tra ký hiệu...</div></div>}
              <div ref={endRef} />
            </div>

            <div className="border-t border-slate-100 bg-white p-4 sm:p-5"><div className="mb-3 flex gap-2 overflow-x-auto pb-1">{aiPromptSuggestions.slice(0, 3).map((prompt) => <button key={prompt} onClick={() => setInput(prompt)} className="whitespace-nowrap rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100">{prompt}</button>)}</div><form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendCurrent(); } }} className="min-h-20 w-full resize-none bg-transparent px-2 py-1 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400" placeholder="Nhập câu hỏi, bài tập hoặc phương trình hóa học..." /><div className="flex items-center justify-between"><span className="px-2 text-xs text-slate-400">Enter để gửi · Shift + Enter xuống dòng</span><button disabled={!input.trim() || busy} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-40"><Send className="h-4 w-4" /> Gửi câu hỏi</button></div></form></div>
          </div>

          <aside className="order-3 space-y-4">
            <div className="rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-amber-500 shadow-sm"><Lightbulb className="h-5 w-5" /></span><h2 className="mt-4 text-sm font-black text-slate-800">Cách hỏi hiệu quả</h2><ol className="mt-3 space-y-3">{["Gửi đầy đủ dữ kiện và đơn vị.", "Nêu bước em đang bị vướng.", "Yêu cầu AI kiểm tra lại kết quả."].map((tip, index) => <li key={tip} className="flex gap-2 text-xs leading-5 text-slate-600"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs font-bold text-white">{index + 1}</span>{tip}</li>)}</ol></div>
            <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /><h2 className="text-sm font-black text-slate-800">Học có kiểm chứng</h2></div><p className="mt-3 text-xs leading-5 text-slate-500">AI có thể mắc lỗi. HóaLab luôn trình bày bước giải để em đối chiếu định luật, đơn vị và bảo toàn nguyên tố.</p><div className="mt-4 space-y-2">{["Kiểm tra số nguyên tử", "Đối chiếu điều kiện phản ứng", "Xác nhận đơn vị kết quả"].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"><Check className="h-3.5 w-3.5" /> {item}</div>)}</div></div>
            <button onClick={() => setInput("Hãy kiểm tra lại lời giải gần nhất theo định luật bảo toàn nguyên tố và đơn vị.")} className="flex w-full items-center justify-between rounded-[20px] bg-slate-900 p-4 text-left text-white"><span><span className="block text-xs font-bold">Kiểm tra chéo</span><span className="mt-1 block text-xs text-slate-400">Yêu cầu AI tự rà soát</span></span><ChevronRight className="h-5 w-5" /></button>
          </aside>
        </section>
      </div>
    </main>
  );
}
