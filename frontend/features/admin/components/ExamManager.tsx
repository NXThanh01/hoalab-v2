"use client";

import { useMemo, useState } from "react";
import { BookOpenCheck, CheckCircle2, Copy, Eye, FileQuestion, LoaderCircle, Pencil, Radio, X } from "lucide-react";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";
import { useAdminStudio } from "../hooks/useAdminStudio";
import type { ExamRecord } from "../model/admin.types";

type Studio = ReturnType<typeof useAdminStudio>;
type ExamForm = { title: string; description: string; gradeLevel: number; durationMinutes: number; passScore: number; questionIds: string[]; status: ExamRecord["status"] };
const emptyExam: ExamForm = { title: "", description: "Đề luyện tập được tạo trên HóaLab Admin Studio", gradeLevel: 12, durationMinutes: 45, passScore: 8, questionIds: [], status: "draft" };

export function ExamManager({ studio }: { studio: Studio }) {
  const [form, setForm] = useState<ExamForm>(emptyExam);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ExamRecord | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const availableQuestions = useMemo(() => studio.questions.filter((item) => item.gradeLevel === form.gradeLevel), [form.gradeLevel, studio.questions]);

  function startEdit(exam: ExamRecord) {
    setEditingId(exam.id);
    setForm({ title: exam.title, description: exam.description, gradeLevel: exam.gradeLevel, durationMinutes: exam.durationMinutes, passScore: exam.passScore, questionIds: exam.questionIds, status: exam.status });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicate(exam: ExamRecord) {
    setEditingId(null);
    setForm({ title: `${exam.title} — Bản sao`, description: exam.description, gradeLevel: exam.gradeLevel, durationMinutes: exam.durationMinutes, passScore: exam.passScore, questionIds: exam.questionIds, status: "draft" });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      if (editingId) await studio.updateExam({ ...form, id: editingId });
      else await studio.createExam(form);
      setNotice({ tone: "ok", text: editingId ? "Đã cập nhật kỳ thi." : "Đã tạo bản nháp kỳ thi." });
      setEditingId(null);
      setForm(emptyExam);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Không thể lưu kỳ thi." });
    }
  }

  function toggleQuestion(id: string) {
    setForm((current) => ({ ...current, questionIds: current.questionIds.includes(id) ? current.questionIds.filter((item) => item !== id) : [...current.questionIds, id] }));
  }

  return <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
    <form onSubmit={submit} className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24">
      <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Exam builder</p><h2 className="mt-1 text-2xl font-black">{editingId ? "Chỉnh sửa kỳ thi" : "Tạo kỳ thi mới"}</h2></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyExam); }} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><X className="h-4 w-4" /></button>}</div>
      <div className="mt-5 space-y-3"><Field label="Tên kỳ thi"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="input-admin" placeholder="Thi thử Hóa 12 · Ester và Lipid" /></Field><Field label="Mô tả"><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="input-admin resize-none" /></Field><div className="grid grid-cols-3 gap-2"><Field label="Khối"><select value={form.gradeLevel} onChange={(event) => setForm({ ...form, gradeLevel: Number(event.target.value), questionIds: [] })} className="input-admin"><option value={12}>12</option><option value={11}>11</option><option value={10}>10</option></select></Field><Field label="Phút"><input type="number" min="5" max="180" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} className="input-admin" /></Field><Field label="Điểm đạt"><input type="number" min="0" max="10" step="0.5" value={form.passScore} onChange={(event) => setForm({ ...form, passScore: Number(event.target.value) })} className="input-admin" /></Field></div><div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-600">Câu hỏi ({form.questionIds.length})</span><button type="button" onClick={() => setForm({ ...form, questionIds: availableQuestions.map((item) => item.id) })} className="text-xs font-bold text-indigo-600">Chọn tất cả</button></div><div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">{availableQuestions.map((item) => <label key={item.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${form.questionIds.includes(item.id) ? "border-indigo-200 bg-white" : "border-transparent hover:bg-white"}`}><input type="checkbox" checked={form.questionIds.includes(item.id)} onChange={() => toggleQuestion(item.id)} className="mt-1 accent-indigo-600" /><span className="min-w-0"><span className="line-clamp-2 text-xs font-bold leading-5 text-slate-700">{item.prompt}</span><span className="mt-1 block text-[10px] text-slate-400">{item.subject} · {item.points} điểm</span></span></label>)}{!availableQuestions.length && <p className="p-5 text-center text-xs text-slate-400">Chưa có câu hỏi cho khối này.</p>}</div></div>
      {notice && <p className={`mt-4 rounded-xl px-3 py-2 text-xs font-bold ${notice.tone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{notice.text}</p>}
      <button disabled={studio.mutating || !form.questionIds.length} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white disabled:opacity-40">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {editingId ? "Lưu thay đổi" : "Tạo bản nháp"}</button>
    </form>

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5"><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Publishing</p><h2 className="mt-1 text-2xl font-black">Danh sách kỳ thi</h2></div><div className="space-y-3">{studio.exams.length ? studio.exams.map((exam) => <article key={exam.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${exam.status === "published" ? "bg-emerald-50 text-emerald-600" : exam.status === "archived" ? "bg-slate-100 text-slate-400" : "bg-amber-50 text-amber-600"}`}>{exam.status === "published" ? <Radio className="h-5 w-5" /> : <BookOpenCheck className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-800">{exam.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${exam.status === "published" ? "bg-emerald-50 text-emerald-600" : exam.status === "archived" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}>{exam.status === "published" ? "Đang mở" : exam.status === "archived" ? "Đã kết thúc" : "Bản nháp"}</span></div><p className="mt-1 text-xs text-slate-500">Hóa {exam.gradeLevel} · {exam.questionCount} câu · {exam.durationMinutes} phút · đạt {exam.passScore}/10</p></div></div><div className="mt-4 flex flex-wrap gap-2"><Action onClick={() => setPreview(exam)} icon={Eye} label="Xem trước" /><Action onClick={() => startEdit(exam)} icon={Pencil} label="Sửa" /><Action onClick={() => duplicate(exam)} icon={Copy} label="Nhân bản" />{exam.status !== "published" ? <button type="button" disabled={studio.mutating} onClick={() => void studio.updateExamStatus(exam.id, "published")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Xuất bản</button> : <button type="button" disabled={studio.mutating} onClick={() => void studio.updateExamStatus(exam.id, "archived")} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600">Kết thúc</button>}</div></article>) : <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center"><FileQuestion className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm text-slate-400">Chưa có kỳ thi.</p></div>}</div></section>

    {preview && <ExamPreview exam={preview} studio={studio} onClose={() => setPreview(null)} />}
  </div>;
}

function ExamPreview({ exam, studio, onClose }: { exam: ExamRecord; studio: Studio; onClose: () => void }) {
  const questions = exam.questionIds.map((id) => studio.questions.find((item) => item.id === id)).filter(Boolean);
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-500">Xem trước đề thi</p><h3 className="mt-1 text-2xl font-black">{exam.title}</h3><p className="mt-2 text-sm text-slate-500">{exam.questionCount} câu · {exam.durationMinutes} phút · đạt {exam.passScore}/10</p></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-6 space-y-3">{questions.map((item, index) => item && <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-black text-indigo-500">Câu {index + 1} · {item.points} điểm</p><p className="mt-2 text-sm font-bold leading-6"><ChemicalNotation value={item.prompt} /></p>{item.options.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{item.options.map((option) => <span key={option} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><ChemicalNotation value={option} /></span>)}</div>}</article>)}</div></div></div>;
}

function Action({ onClick, icon: Icon, label }: { onClick: () => void; icon: typeof Eye; label: string }) { return <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600"><Icon className="h-3.5 w-3.5" /> {label}</button>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>; }
