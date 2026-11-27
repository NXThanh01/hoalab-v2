"use client";

import { useState } from "react";
import { readQuestionFile } from "../model/question-import";
import type { ImportedQuestion } from "@/shared/question-input";
import type { useAdminStudio } from "../hooks/useAdminStudio";

export function ImportQuestionsPanel({ studio }: { studio: ReturnType<typeof useAdminStudio> }) {
  const [rows, setRows] = useState<ImportedQuestion[]>([]);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function select(file?: File) {
    if (!file) return;
    setReading(true);
    setRows([]);
    setFileName(file.name);
    setNotice("");
    setError("");
    try {
      setRows(await readQuestionFile(file));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không đọc được tệp.");
    } finally {
      setReading(false);
    }
  }

  async function submit() {
    setError("");
    try {
      await studio.importQuestions(rows);
      setNotice(`Đã nhập ${rows.length} câu hỏi vào ngân hàng.`);
      setRows([]);
      setFileName("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không thể nhập câu hỏi.");
    }
  }

  return (
    <section className="mt-5 space-y-4 rounded-2xl border border-slate-200 p-4" aria-labelledby="import-bank-title">
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <h3 id="import-bank-title" className="font-semibold">Nhập câu hỏi từ tệp</h3>
        <a href="/mau-cau-hoi-hoalab.csv" download className="inline-flex min-h-11 items-center text-sm font-medium text-blue-800 underline underline-offset-4">Tải CSV mẫu</a>
      </div>
      <label className="block">
        <span className="text-sm text-slate-600">Chọn CSV hoặc JSON, tối đa 100 câu và 1 MB.</span>
        <input type="file" accept=".csv,.json" disabled={reading || studio.mutating} className="input-admin mt-2 min-h-11 file:mr-2 file:font-medium" onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          void select(file);
        }} />
      </label>
      {fileName && <p className="break-all text-sm text-slate-600">{fileName}{rows.length ? ` · ${rows.length} câu hợp lệ` : ""}</p>}
      {rows.length > 0 && <QuestionImportPreview rows={rows} />}
      {reading && <p role="status" className="text-sm">Đang đọc tệp…</p>}
      {error && <p role="alert" className="break-words text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
      <button type="button" disabled={!rows.length || reading || studio.mutating} onClick={() => void submit()} className="min-h-11 w-full rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-40 sm:w-auto">
        {studio.mutating ? "Đang nhập…" : "Nhập vào ngân hàng"}
      </button>
    </section>
  );
}

export function QuestionImportPreview({ rows }: { rows: ImportedQuestion[] }) {
  return <details className="rounded-xl border border-slate-200 bg-white px-3">
    <summary className="min-h-11 cursor-pointer py-2.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-600">Xem trước câu hỏi</summary>
    <ol className="max-h-64 list-decimal space-y-3 overflow-y-auto break-words pb-3 pl-5 text-sm text-slate-700">
      {rows.map((row, index) => <li key={index}>{row.prompt}<p className="mt-1 text-slate-500">Hóa {row.gradeLevel}{row.correctAnswer ? ` · Đáp án: ${row.correctAnswer}` : ""}</p></li>)}
    </ol>
  </details>;
}
