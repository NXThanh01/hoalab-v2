"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, CirclePlay, Clock3, FileVideo2, LibraryBig, Search, Sparkles, Video, VideoOff } from "lucide-react";
import { useLearning } from "@/frontend/features/learning/model/LearningContext";
import { grade12Curriculum, gradeLibraries, type CurriculumLesson } from "../data/curriculum.data";

export function CourseCatalogView() {
  const { goToLesson } = useLearning();
  const [grade, setGrade] = useState(12);
  const [openChapter, setOpenChapter] = useState("ester-lipid");
  const [selected, setSelected] = useState<CurriculumLesson>(grade12Curriculum[0].lessons[0]);
  const [query, setQuery] = useState("");
  const [published, setPublished] = useState<Record<string, { videoUrl: string; checkpointCount: number }>>({});

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/lessons", { cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : { lessons: [] })
      .then((data: { lessons: Array<{ id: string; videoUrl: string; checkpoints: unknown[] }> }) => {
        setPublished(Object.fromEntries(data.lessons.map((item) => [item.id, { videoUrl: item.videoUrl, checkpointCount: item.checkpoints.length }])));
      }).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const chapters = useMemo(() => grade12Curriculum.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.filter((item) => item.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))),
  })).filter((chapter) => chapter.lessons.length > 0), [query]);
  const selectedPublished = published[selected.id];

  function chooseGrade(value: number) {
    setGrade(value);
    if (value === 12) setOpenChapter("ester-lipid");
  }

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#f4f5f7] px-4 py-7 sm:px-6 lg:ml-[232px] lg:px-7">
      <div className="mx-auto max-w-[1320px]">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
          <div><p className="flex items-center gap-2 text-sm font-semibold text-indigo-700"><LibraryBig className="h-4 w-4" /> Kho tài liệu</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Học theo đúng chương, đúng bài.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Thư viện Hóa học THPT gồm video bài giảng, câu hỏi tương tác trong video và bài luyện tập.</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Đang tập trung</p><p className="mt-1 text-lg font-bold text-slate-900">Hóa 12 · Kết nối tri thức</p></div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {gradeLibraries.map((item) => <button key={item.grade} type="button" onClick={() => chooseGrade(item.grade)} className={`rounded-2xl border p-4 text-left transition ${grade === item.grade ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "border-slate-200 bg-white hover:border-slate-300"}`}><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${grade === item.grade ? "bg-white/15" : "bg-slate-100 text-slate-600"}`}><BookOpen className="h-5 w-5" /></span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${item.available ? grade === item.grade ? "bg-emerald-400/20 text-emerald-100" : "bg-emerald-50 text-emerald-700" : grade === item.grade ? "bg-white/15 text-white/80" : "bg-slate-100 text-slate-500"}`}>{item.available ? "Đang phát triển" : "Sắp cập nhật"}</span></div><h2 className="mt-4 text-lg font-bold">{item.label}</h2><p className={`mt-1 text-sm ${grade === item.grade ? "text-indigo-100" : "text-slate-500"}`}>{item.description}</p></button>)}
        </section>

        {grade !== 12 ? <section className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-4 text-xl font-bold text-slate-900">Kho Hóa {grade} đang được biên soạn</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Cấu trúc đã sẵn sàng. Admin có thể bổ sung chương, bài và video sau khi hoàn thiện nội dung Hóa 12.</p><button type="button" onClick={() => chooseGrade(12)} className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Xem kho Hóa 12</button></section> : <>
          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold text-slate-950">Danh sách bài học Hóa 12</h2><p className="mt-1 text-sm text-slate-500">8 chương · 30 bài · Bộ Kết nối tri thức với cuộc sống</p></div><label className="relative block w-full sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm bài học..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label></div>

          <section className="mt-4 grid gap-5 xl:grid-cols-[1fr_310px]">
            <div className="space-y-3">
              {chapters.map((chapter) => { const expanded = openChapter === chapter.id || query.length > 0; return <article key={chapter.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><button type="button" onClick={() => setOpenChapter(expanded && !query ? "" : chapter.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-700">{chapter.number}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-900">Chương {chapter.number}. {chapter.title}</span><span className="mt-1 block text-xs text-slate-500">{chapter.lessons.length} bài học</span></span>{expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}</button>{expanded && <div className="border-t border-slate-100">{chapter.lessons.map((item) => <button key={item.id} type="button" onClick={() => setSelected(item)} className={`flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3.5 text-left last:border-0 ${selected.id === item.id ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${item.videoStatus === "ready" ? "bg-emerald-100 text-emerald-700" : item.videoStatus === "draft" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{item.number}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">Bài {item.number}. {item.title}</span><span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">{item.videoStatus === "ready" ? <><Video className="h-3.5 w-3.5" /> Video {item.durationMinutes} phút · {item.checkpointCount} checkpoint</> : item.videoStatus === "draft" ? <><FileVideo2 className="h-3.5 w-3.5" /> Bản nháp video</> : <><VideoOff className="h-3.5 w-3.5" /> Chưa có video</>}</span></span><ChevronRight className="h-4 w-4 shrink-0 text-slate-300" /></button>)}</div>}</article>; })}
            </div>

            <aside className="self-start xl:sticky xl:top-24"><div className="rounded-2xl bg-[#172033] p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Bài đang chọn</p><p className="mt-3 text-sm text-slate-400">Bài {selected.number}</p><h2 className="mt-1 text-xl font-bold leading-7">{selected.title}</h2>{selected.videoStatus === "ready" || selectedPublished ? <><div className="mt-5 flex items-center gap-4 text-sm text-slate-300"><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {selected.durationMinutes ?? "—"} phút</span><span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> {selectedPublished?.checkpointCount ?? selected.checkpointCount} câu hỏi</span></div><button type="button" onClick={goToLesson} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900"><CirclePlay className="h-4 w-4" /> {selected.progress ? "Tiếp tục học" : "Bắt đầu học"}</button></> : <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><VideoOff className="h-4 w-4" /> Chưa xuất bản video</p><p className="mt-2 text-xs leading-5 text-slate-400">Admin sẽ gắn video và đặt câu hỏi tại các mốc thời gian trong Admin Studio.</p></div>}</div><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5"><p className="flex items-center gap-2 text-sm font-bold text-slate-900"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Cấu trúc một bài</p><ol className="mt-3 space-y-2 text-sm text-slate-500"><li>1. Video bài giảng</li><li>2. Câu hỏi tại checkpoint</li><li>3. Luyện tập cuối bài</li><li>4. Lưu tiến độ học</li></ol></div></aside>
          </section>
        </>}
      </div>
    </main>
  );
}
