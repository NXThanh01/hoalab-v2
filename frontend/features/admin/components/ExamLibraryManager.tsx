"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronRight, CloudUpload, FileJson2, FileText, Folder, FolderOpen, FolderPlus, LoaderCircle, Plus, Sparkles, X } from "lucide-react";
import { useAdminStudio } from "../hooks/useAdminStudio";
import { readQuestionFile } from "../model/question-import";
import { QuestionImportPreview } from "./ImportQuestionsPanel";
import type { ImportedQuestion } from "@/shared/question-input";

type Studio = ReturnType<typeof useAdminStudio>;

export function ExamLibraryManager({ studio, openExamBuilder }: { studio: Studio; openExamBuilder: () => void }) {
  const [grade, setGrade] = useState(12);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [rows, setRows] = useState<ImportedQuestion[]>([]);
  const [reading, setReading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"quiz" | "exam">("quiz");
  const [duration, setDuration] = useState(15);
  const [notice, setNotice] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const folders = useMemo(() => studio.folders.filter((item) => item.gradeLevel === grade), [grade, studio.folders]);
  const currentFolder = folders.find((item) => item.id === selectedFolder);
  const folderExams = studio.exams.filter((item) => item.gradeLevel === grade && item.folderId === selectedFolder);

  async function createFolder() {
    try {
      const result = await studio.createFolder({ name: folderName, description: folderDescription, gradeLevel: grade, color: "indigo" }) as { id?: string };
      if (result.id) setSelectedFolder(result.id);
      setFolderName(""); setFolderDescription(""); setShowNewFolder(false); setNotice("Đã tạo thư mục mới.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tạo thư mục."); }
  }

  async function chooseFile(file?: File) {
    if (!file || reading || studio.mutating) return;
    setReading(true);
    setRows([]);
    setNotice(""); setFileName(file.name); setTitle(file.name.replace(/\.(json|csv)$/i, ""));
    try {
      setRows(await readQuestionFile(file, grade));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không đọc được tệp đề.");
    } finally {
      setReading(false);
    }
  }

  async function createFromFile() {
    if (!currentFolder || !rows.length || reading || studio.mutating) return;
    try {
      await studio.createExam({ title, description: `Nhập từ ${fileName}`, gradeLevel: grade, folderId: currentFolder.id, kind, durationMinutes: duration, passScore: 8, importedQuestions: rows });
      setRows([]); setFileName(""); setTitle(""); setNotice(`Đã tạo bản nháp trong thư mục ${currentFolder.name}. Mở Kỳ thi để kiểm tra và xuất bản.`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể tạo đề từ file."); }
  }

  return <div className="space-y-5">
    <header className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Kho đề</p><h2 className="mt-1 text-2xl font-black text-slate-950">Quản lý như thư mục trên máy tính</h2><p className="mt-2 text-sm text-slate-500">Tạo thư mục theo mục đích, sau đó nhập file để sinh Quiz hoặc Đề thi.</p></div><div className="flex flex-wrap rounded-xl bg-slate-100 p-1">{[10, 11, 12].map((value) => <button key={value} type="button" disabled={reading || studio.mutating} onClick={() => { setGrade(value); setSelectedFolder(null); setRows([]); setTitle(""); setFileName(""); setNotice(""); }} className={`rounded-lg px-4 py-2 text-sm font-bold ${grade === value ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}>Hóa {value}</button>)}</div></header>

    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="self-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400">THƯ MỤC HÓA {grade}</p><p className="mt-1 text-sm font-bold">{folders.length} thư mục</p></div><button type="button" onClick={() => setShowNewFolder(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-bold text-white"><FolderPlus className="h-4 w-4" /> Tạo folder</button></div><div className="mt-4 space-y-1">{folders.map((item) => <button key={item.id} type="button" onClick={() => setSelectedFolder(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${selectedFolder === item.id ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selectedFolder === item.id ? "bg-indigo-600 text-white" : "bg-amber-50 text-amber-500"}`}>{selectedFolder === item.id ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5 fill-current" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.name}</span><span className="mt-0.5 block text-xs text-slate-400">{item.examCount} mục</span></span><ChevronRight className="h-4 w-4 text-slate-300" /></button>)}{!folders.length && <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center"><FolderPlus className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-500">Chưa có thư mục</p><p className="mt-1 text-xs text-slate-400">Tạo folder đầu tiên cho Hóa {grade}.</p></div>}</div></aside>

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">{currentFolder ? <><div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-500"><FolderOpen className="h-6 w-6 fill-current" /></span><div><h3 className="text-xl font-black">{currentFolder.name}</h3><p className="mt-1 text-sm text-slate-500">{currentFolder.description || `Thư mục đề Hóa ${grade}`}</p></div></div><button type="button" disabled={reading || studio.mutating} onClick={() => inputRef.current?.click()} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white"><CloudUpload className="h-4 w-4" /> Nhập file đề</button><input ref={inputRef} type="file" accept=".json,.csv" className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void chooseFile(file); }} /></div>
        <a href="/mau-cau-hoi-hoalab.csv" download className="inline-flex min-h-11 items-center text-sm font-medium text-blue-800 underline underline-offset-4">Tải CSV mẫu</a>
        {rows.length ? <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white">{fileName.endsWith(".json") ? <FileJson2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span><div><p className="break-all font-black">{fileName}</p><p className="mt-1 text-xs text-slate-500">Đã đọc {rows.length} câu hỏi · Chưa lưu vào hệ thống</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Tên hiển thị</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="input-admin" /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Loại nội dung</span><select value={kind} onChange={(event) => { const value = event.target.value as "quiz" | "exam"; setKind(value); setDuration(value === "quiz" ? 15 : 45); }} className="input-admin"><option value="quiz">Quiz luyện nhanh</option><option value="exam">Đề thi / Phòng thi</option></select></label><label><span className="mb-1.5 block text-xs font-bold text-slate-600">Thời gian</span><input type="number" min="5" max="180" value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="input-admin" /></label><div className="flex items-end"><button type="button" disabled={studio.mutating || reading || title.trim().length < 4 || !Number.isInteger(duration) || duration < 5 || duration > 180} onClick={() => void createFromFile()} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white disabled:opacity-40">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Tạo {kind === "quiz" ? "Quiz" : "Đề thi"}</button></div></div><div className="mt-4"><QuestionImportPreview rows={rows} /></div></div> : <button type="button" disabled={reading || studio.mutating} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files[0]); }} className="mt-5 flex min-h-48 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30"><CloudUpload className="h-8 w-8 text-slate-300" /><p className="mt-3 font-bold text-slate-700">{reading ? "Đang đọc tệp…" : "Thả hoặc chọn tệp đề"}</p><p className="mt-1 text-sm text-slate-400">JSON, CSV · tối đa 100 câu</p></button>}
        <div className="mt-6"><div className="flex items-center justify-between"><h4 className="text-sm font-black">Nội dung trong thư mục</h4><button type="button" onClick={openExamBuilder} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600"><Plus className="h-4 w-4" /> Tạo thủ công</button></div><div className="mt-3 space-y-2">{folderExams.map((exam) => <div key={exam.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><span className={`grid h-9 w-9 place-items-center rounded-lg ${exam.kind === "quiz" ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-600"}`}><FileText className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{exam.title}</p><p className="mt-1 text-xs text-slate-400">{exam.kind === "quiz" ? "Quiz" : "Đề thi"} · {exam.questionCount} câu · {exam.durationMinutes} phút</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${exam.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{exam.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span></div>)}{!folderExams.length && <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-400">Thư mục đang trống.</p>}</div></div></> : <div className="grid min-h-[480px] place-items-center text-center"><div><Folder className="mx-auto h-14 w-14 text-slate-200" /><h3 className="mt-4 text-xl font-black">Chọn một thư mục</h3><p className="mt-2 text-sm text-slate-500">Hoặc tạo folder mới để bắt đầu nhập đề Hóa {grade}.</p></div></div>}</section>
    </div>

    {notice && <p className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</p>}
    {showNewFolder && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Hóa {grade}</p><h3 className="mt-1 text-xl font-black">Tạo thư mục mới</h3></div><button type="button" onClick={() => setShowNewFolder(false)} className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100"><X className="h-4 w-4" /></button></div><label className="mt-5 block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Tên thư mục</span><input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Ví dụ: Giữa học kỳ I" className="input-admin" /></label><label className="mt-3 block"><span className="mb-1.5 block text-xs font-bold text-slate-600">Mô tả</span><textarea rows={3} value={folderDescription} onChange={(event) => setFolderDescription(event.target.value)} placeholder="Các đề ôn tập chương 1–3" className="input-admin resize-none" /></label><button type="button" disabled={folderName.trim().length < 2 || studio.mutating} onClick={() => void createFolder()} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-bold text-white disabled:opacity-40">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} Tạo thư mục</button></div></div>}
  </div>;
}
