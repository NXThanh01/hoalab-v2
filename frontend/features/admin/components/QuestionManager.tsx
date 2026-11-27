"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy, FileQuestion, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";
import { useAdminStudio } from "../hooks/useAdminStudio";
import type { Difficulty, QuestionRecord, QuestionType } from "../model/admin.types";
import { ImportQuestionsPanel } from "./ImportQuestionsPanel";

type Studio = ReturnType<typeof useAdminStudio>;
type QuestionForm = {
  type: QuestionType;
  subject: string;
  gradeLevel: number;
  prompt: string;
  optionsText: string;
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  points: number;
};

const emptyQuestion: QuestionForm = { type: "multiple_choice", subject: "Ester - Lipid", gradeLevel: 12, prompt: "", optionsText: "", correctAnswer: "", explanation: "", difficulty: "medium", points: 1 };

export function QuestionManager({ studio }: { studio: Studio }) {
  const [form, setForm] = useState<QuestionForm>(emptyQuestion);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">(12);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const filtered = useMemo(() => studio.questions.filter((item) => (gradeFilter === "all" || item.gradeLevel === gradeFilter) && `${item.prompt} ${item.subject}`.toLowerCase().includes(query.toLowerCase())), [gradeFilter, query, studio.questions]);

  function openCreate(seed: QuestionForm = emptyQuestion) {
    setEditingId(null);
    setForm(seed);
    setEditorOpen(true);
    setNotice(null);
  }

  function openEdit(item: QuestionRecord) {
    setEditingId(item.id);
    setForm({ type: item.type, subject: item.subject, gradeLevel: item.gradeLevel, prompt: item.prompt, optionsText: item.options.join("\n"), correctAnswer: item.correctAnswer, explanation: item.explanation, difficulty: item.difficulty, points: item.points });
    setEditorOpen(true);
    setNotice(null);
  }

  function duplicate(item: QuestionRecord) {
    openCreate({ type: item.type, subject: item.subject, gradeLevel: item.gradeLevel, prompt: `${item.prompt} (bản sao)`, optionsText: item.options.join("\n"), correctAnswer: item.correctAnswer, explanation: item.explanation, difficulty: item.difficulty, points: item.points });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const payload = { ...form, options: form.type === "multiple_choice" ? form.optionsText.split("\n").map((item) => item.trim()).filter(Boolean) : [] };
    try {
      if (editingId) await studio.updateQuestion({ ...payload, id: editingId });
      else await studio.createQuestion(payload);
      setNotice({ tone: "ok", text: editingId ? "Đã cập nhật câu hỏi." : "Đã thêm câu hỏi vào ngân hàng." });
      setEditorOpen(false);
      setEditingId(null);
      setForm(emptyQuestion);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể lưu câu hỏi." });
    }
  }

  async function remove(item: QuestionRecord) {
    if (!window.confirm(`Xóa câu hỏi “${item.prompt.slice(0, 80)}”?`)) return;
    try {
      await studio.deleteQuestion(item.id);
      setNotice({ tone: "ok", text: "Đã xóa câu hỏi." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể xóa câu hỏi." });
    }
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Content library</p><h2 className="mt-1 text-2xl font-black">Ngân hàng câu hỏi <span className="text-slate-400">({studio.questions.length})</span></h2></div><div className="flex flex-wrap gap-2"><button type="button" aria-expanded={importOpen} onClick={() => setImportOpen((open) => !open)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold">Nhập tệp</button><button type="button" onClick={() => openCreate()} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Tạo câu hỏi</button></div></div>
      {importOpen && <ImportQuestionsPanel studio={studio} />}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="relative block flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-indigo-300 focus:bg-white" placeholder="Tìm nội dung hoặc chủ đề..." /></label><div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">{([12, 11, 10, "all"] as const).map((grade) => <button type="button" key={grade} onClick={() => setGradeFilter(grade)} className={`rounded-lg px-3 py-2 text-xs font-black ${gradeFilter === grade ? "bg-white text-indigo-700 shadow-sm" : "text-slate-400"}`}>{grade === "all" ? "Tất cả" : grade}</button>)}</div></div>
      {notice && <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${notice.tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{notice.text}</p>}
      <div className="mt-4 space-y-3">{filtered.length ? filtered.map((item, index) => <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-500">{index + 1}</span><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase text-indigo-600">Hóa {item.gradeLevel}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{item.subject}</span><span className="text-[10px] font-semibold text-slate-400">{item.points} điểm</span></div><p className="text-sm font-bold leading-6 text-slate-800"><ChemicalNotation value={item.prompt} /></p>{item.options.length > 0 && <p className="mt-2 truncate text-xs text-slate-500">{item.options.join(" · ")}</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700"><Pencil className="h-3.5 w-3.5" /> Sửa</button><button type="button" onClick={() => duplicate(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"><Copy className="h-3.5 w-3.5" /> Nhân bản</button><button type="button" onClick={() => void remove(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600"><Trash2 className="h-3.5 w-3.5" /> Xóa</button></div></div></div></article>) : <EmptyQuestion />}</div>
    </section>
    <aside>{editorOpen ? <form onSubmit={submit} className="sticky top-24 rounded-3xl border border-indigo-200 bg-white p-5 shadow-xl shadow-indigo-100/70"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Question builder</p><h3 className="mt-1 text-lg font-black">{editingId ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}</h3></div><button type="button" onClick={() => setEditorOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><X className="h-4 w-4" /></button></div><QuestionFormFields form={form} setForm={setForm} /><button disabled={studio.mutating} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white disabled:opacity-50">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {editingId ? "Lưu thay đổi" : "Lưu vào ngân hàng"}</button></form> : <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-7 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Plus className="h-6 w-6" /></span><p className="mt-4 font-black">Trình soạn câu hỏi</p><p className="mt-2 text-sm leading-6 text-slate-500">Tạo mới, chỉnh sửa hoặc nhân bản câu hỏi trực tiếp trong ngân hàng.</p><button type="button" onClick={() => openCreate()} className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Mở trình soạn</button></div>}</aside>
  </div>;
}

function QuestionFormFields({ form, setForm }: { form: QuestionForm; setForm: React.Dispatch<React.SetStateAction<QuestionForm>> }) {
  return <div className="space-y-3"><div className="grid grid-cols-2 gap-3"><Field label="Loại"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as QuestionType })} className="input-admin"><option value="multiple_choice">Trắc nghiệm</option><option value="essay">Tự luận</option><option value="equation">Phương trình</option></select></Field><Field label="Khối"><select value={form.gradeLevel} onChange={(event) => setForm({ ...form, gradeLevel: Number(event.target.value) })} className="input-admin"><option value={12}>Hóa 12</option><option value={11}>Hóa 11</option><option value={10}>Hóa 10</option></select></Field></div><Field label="Chủ đề"><input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="input-admin" /></Field><Field label="Nội dung"><textarea required rows={4} value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} className="input-admin resize-none" /></Field>{form.type === "multiple_choice" && <Field label="Lựa chọn — mỗi dòng một đáp án"><textarea required rows={4} value={form.optionsText} onChange={(event) => setForm({ ...form, optionsText: event.target.value })} className="input-admin resize-none" /></Field>}<Field label="Đáp án đúng"><input required value={form.correctAnswer} onChange={(event) => setForm({ ...form, correctAnswer: event.target.value })} className="input-admin" /></Field><Field label="Giải thích"><textarea rows={3} value={form.explanation} onChange={(event) => setForm({ ...form, explanation: event.target.value })} className="input-admin resize-none" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Độ khó"><select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value as Difficulty })} className="input-admin"><option value="easy">Nhận biết</option><option value="medium">Thông hiểu</option><option value="hard">Vận dụng</option></select></Field><Field label="Trọng số"><input type="number" min="0.25" max="10" step="0.25" value={form.points} onChange={(event) => setForm({ ...form, points: Number(event.target.value) })} className="input-admin" /></Field></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>; }
function EmptyQuestion() { return <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center"><FileQuestion className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm text-slate-400">Chưa có câu hỏi phù hợp.</p></div>; }
