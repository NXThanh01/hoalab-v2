"use client";

import { useState } from "react";
import { BookOpenCheck, Files, FolderOpen, GraduationCap } from "lucide-react";
import { PublishedExams } from "./PublishedExams";

const grades = [
  { value: 10, title: "Hóa học 10", subtitle: "Nền tảng và cấu tạo chất", available: false },
  { value: 11, title: "Hóa học 11", subtitle: "Cân bằng và hóa hữu cơ", available: false },
  { value: 12, title: "Hóa học 12", subtitle: "Quiz và đề thi theo thư mục", available: true },
];

export function PracticeHubView() {
  const [grade, setGrade] = useState(12);

  return <main className="min-h-[calc(100vh-68px)] bg-[#f4f5f7] px-4 py-7 sm:px-6 lg:ml-[232px] lg:px-7"><div className="mx-auto max-w-[1180px]">
    <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-semibold text-indigo-700"><BookOpenCheck className="h-4 w-4" /> Luyện đề</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Chọn khối lớp để bắt đầu.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Quiz luyện nhanh và đề thi được sắp xếp thành thư mục, đúng theo nội dung Admin đã xuất bản.</p></div><div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Kho đang mở</p><p className="mt-1 text-lg font-bold text-slate-900">Hóa {grade}</p></div></header>

    <section className="mt-6 grid gap-3 sm:grid-cols-3">{grades.map((item) => <button key={item.value} type="button" onClick={() => setGrade(item.value)} className={`rounded-2xl border p-5 text-left transition ${grade === item.value ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "border-slate-200 bg-white hover:border-slate-300"}`}><div className="flex items-center justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${grade === item.value ? "bg-white/15" : "bg-slate-100 text-slate-600"}`}><GraduationCap className="h-5 w-5" /></span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.available ? grade === item.value ? "bg-emerald-400/20 text-emerald-100" : "bg-emerald-50 text-emerald-700" : grade === item.value ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-500"}`}>{item.available ? "Có nội dung" : "Sắp cập nhật"}</span></div><h2 className="mt-4 text-lg font-bold">{item.title}</h2><p className={`mt-1 text-sm ${grade === item.value ? "text-indigo-100" : "text-slate-500"}`}>{item.subtitle}</p></button>)}</section>

    {grade === 12 ? <section className="mt-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500"><FolderOpen className="h-5 w-5 fill-current" /></span><div><h2 className="text-xl font-bold text-slate-950">Kho đề Hóa 12</h2><p className="mt-0.5 text-sm text-slate-500">Mở một thư mục để xem Quiz và Đề thi bên trong.</p></div></div><PublishedExams gradeLevel={12} /></section> : <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Files className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-xl font-bold text-slate-900">Kho đề Hóa {grade} chưa có nội dung</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Khi Admin tạo thư mục và xuất bản đề cho khối này, nội dung sẽ tự động xuất hiện tại đây.</p><button type="button" onClick={() => setGrade(12)} className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Xem kho đề Hóa 12</button></section>}
  </div></main>;
}
