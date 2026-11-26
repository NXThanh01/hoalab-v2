"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookMarked, ChevronDown, Search, X } from "lucide-react";
import { notebookTabs } from "@/frontend/features/learning/data/lesson.data";

type Tab = keyof typeof notebookTabs;

export function FloatingNotebookWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("Trọng tâm");
  const [query, setQuery] = useState("");

  const notes = useMemo(() => {
    const entries = notebookTabs[tab];
    if (!query.trim()) return entries;
    const normalized = query.toLowerCase();
    return entries.filter((note) => `${note.title} ${note.text}`.toLowerCase().includes(normalized));
  }, [query, tab]);

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 330, damping: 28 }}
            className="mb-3 w-[min(390px,calc(100vw-32px))] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,.22)]"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 px-5 pb-4 pt-5 text-white">
              <div className="absolute -right-7 -top-10 h-32 w-32 rounded-full border-[18px] border-white/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><BookMarked className="h-5 w-5" /></span>
                  <div><p className="text-sm font-black">Sổ tay Ester và Lipid</p><p className="text-xs text-indigo-100">Hóa học 12 · Tra cứu nhanh</p></div>
                </div>
                <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20" aria-label="Đóng sổ tay"><X className="h-4 w-4" /></button>
              </div>
              <label className="relative mt-4 block"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-200" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full rounded-xl border border-white/10 bg-white/10 pl-9 pr-3 text-xs outline-none placeholder:text-indigo-200 focus:bg-white/15" placeholder="Tìm công thức, khái niệm..." /></label>
            </div>
            <div className="border-b border-slate-100 px-4 pt-3">
              <div className="flex gap-1 overflow-x-auto">{(Object.keys(notebookTabs) as Tab[]).map((item) => <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-bold transition ${tab === item ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400"}`}>{item}</button>)}</div>
            </div>
            <div className="max-h-[300px] space-y-2 overflow-y-auto p-4">
              {notes.length ? notes.map((note, index) => <motion.div key={note.title} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .05 }} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5"><p className="text-xs font-black text-slate-700">{note.title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{note.text}</p></motion.div>) : <p className="py-8 text-center text-xs text-slate-400">Không tìm thấy ghi chú phù hợp.</p>}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-400"><span>Đồng bộ với bài đang học</span><span className="flex items-center gap-1 text-emerald-500"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Đã lưu</span></div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        drag
        dragConstraints={{ left: -240, right: 0, top: -420, bottom: 0 }}
        dragElastic={0.12}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((value) => !value)}
        className="ml-auto flex h-[58px] items-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 p-2 pr-4 text-white shadow-[0_14px_35px_rgba(79,70,229,.42)]"
        aria-expanded={open}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15"><BookMarked className="h-5 w-5" /></span>
        <span className="text-xs font-black">Sổ tay</span>
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </motion.button>
    </div>
  );
}
