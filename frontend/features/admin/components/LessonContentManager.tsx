"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CirclePlay, Clock3, FileVideo2, Link2, LoaderCircle, Plus, Save, Trash2, Upload, Video } from "lucide-react";
import { grade12Curriculum, grade12Lessons } from "@/frontend/features/hubs/data/curriculum.data";
import type { useAdminStudio } from "../hooks/useAdminStudio";
import type { VideoCheckpointRecord } from "../model/admin.types";

const emptyCheckpoint = (): VideoCheckpointRecord => ({ id: crypto.randomUUID(), timeSeconds: 0, prompt: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" });
const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

export function LessonContentManager({ studio }: { studio: ReturnType<typeof useAdminStudio> }) {
  const [lessonId, setLessonId] = useState("hoa-12-bai-1");
  const curriculumLesson = grade12Lessons.find((item) => item.id === lessonId) ?? grade12Lessons[0];
  const savedLesson = studio.lessons.find((item) => item.id === lessonId);
  const [videoUrl, setVideoUrl] = useState(savedLesson?.videoUrl ?? "");
  const [localUrl, setLocalUrl] = useState("");
  const [checkpoints, setCheckpoints] = useState<VideoCheckpointRecord[]>(savedLesson?.checkpoints ?? []);
  const [checkpoint, setCheckpoint] = useState(emptyCheckpoint);
  const [notice, setNotice] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  function chooseLesson(id: string) {
    const stored = studio.lessons.find((item) => item.id === id);
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLessonId(id);
    setVideoUrl(stored?.videoUrl ?? "");
    setCheckpoints(stored?.checkpoints ?? []);
    setCheckpoint(emptyCheckpoint());
    setLocalUrl("");
    setNotice("");
  }

  function selectLocalVideo(file?: File) {
    if (!file) return;
    if (localUrl) URL.revokeObjectURL(localUrl);
    setLocalUrl(URL.createObjectURL(file));
    setNotice("File đang được xem trước trên máy. Hãy thêm URL lưu trữ để xuất bản.");
  }

  function captureTime() {
    setCheckpoint((current) => ({ ...current, timeSeconds: Math.floor(videoRef.current?.currentTime ?? 0) }));
  }

  function addCheckpoint() {
    if (checkpoint.prompt.trim().length < 5 || checkpoint.options.some((item) => !item.trim())) {
      setNotice("Nhập câu hỏi và đủ 4 phương án trước khi thêm checkpoint."); return;
    }
    setCheckpoints((items) => [...items, checkpoint].sort((a, b) => a.timeSeconds - b.timeSeconds));
    setCheckpoint(emptyCheckpoint());
    setNotice("Đã thêm checkpoint vào bản nháp. Bấm Lưu để ghi vào hệ thống.");
  }

  async function save(status: "draft" | "published") {
    if (status === "published" && !videoUrl.trim()) { setNotice("Cần URL video trước khi xuất bản. File cục bộ chỉ dùng để xem trước."); return; }
    try {
      await studio.saveLesson({ id: curriculumLesson.id, gradeLevel: 12, textbookSeries: "Kết nối tri thức", chapterId: curriculumLesson.chapterId, lessonNumber: curriculumLesson.number, title: curriculumLesson.title, videoUrl, status, checkpoints });
      setNotice(status === "published" ? "Đã xuất bản bài giảng vào Kho tài liệu." : "Đã lưu bản nháp bài giảng.");
    } catch { setNotice("Chưa lưu được bài giảng. Kiểm tra URL và thử lại."); }
  }

  return <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
  <aside className="self-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-24"><div className="mb-4"><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Kho tài liệu</p><h2 className="mt-1 text-xl font-black">Bài giảng Hóa 12</h2><p className="mt-1 text-xs leading-5 text-slate-500">Chọn bài theo SGK để gắn video và checkpoint.</p></div><div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">{grade12Curriculum.map((chapter) => <div key={chapter.id}><p className="mb-1.5 px-2 text-xs font-bold text-slate-400">Chương {chapter.number}. {chapter.title}</p>{chapter.lessons.map((item) => { const saved = studio.lessons.find((lesson) => lesson.id === item.id); return <button key={item.id} type="button" onClick={() => chooseLesson(item.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${lessonId === item.id ? "bg-indigo-600 text-white" : "hover:bg-slate-50"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${lessonId === item.id ? "bg-white/15" : "bg-slate-100 text-slate-500"}`}>{item.number}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.title}</span>{saved?.status === "published" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}</button>; })}</div>)}</div></aside>

    <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Bài {curriculumLesson.number} · {curriculumLesson.chapterTitle}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{curriculumLesson.title}</h2></div><span className={`self-start rounded-full px-3 py-1.5 text-xs font-bold ${savedLesson?.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{savedLesson?.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="relative"><Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="Dán URL video .mp4 hoặc CDN..." className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-indigo-400" /></label><label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><Upload className="h-4 w-4" /> Chọn file xem trước<input type="file" accept="video/*" onChange={(event) => selectLocalVideo(event.target.files?.[0])} className="hidden" /></label></div>{videoUrl || localUrl ? <video ref={videoRef} src={localUrl || videoUrl} controls className="mt-4 aspect-video w-full rounded-2xl bg-slate-950" /> : <div className="mt-4 grid aspect-video place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"><div className="text-center"><FileVideo2 className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-600">Chưa có video</p><p className="mt-1 text-xs text-slate-400">Dán URL hoặc chọn file để bắt đầu đặt câu hỏi.</p></div></div>}</section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Tương tác trong video</p><h2 className="mt-1 text-xl font-black">Tạo checkpoint</h2></div><button type="button" onClick={captureTime} disabled={!videoUrl && !localUrl} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Clock3 className="h-4 w-4" /> Lấy thời điểm hiện tại</button></div><div className="mt-5 grid gap-4 lg:grid-cols-[150px_1fr]"><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Thời điểm (giây)</span><input type="number" min="0" value={checkpoint.timeSeconds} onChange={(event) => setCheckpoint((current) => ({ ...current, timeSeconds: Number(event.target.value) }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Câu hỏi hiển thị</span><input value={checkpoint.prompt} onChange={(event) => setCheckpoint((current) => ({ ...current, prompt: event.target.value }))} placeholder="Ví dụ: Sản phẩm của phản ứng xà phòng hóa là gì?" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{checkpoint.options.map((option, index) => <label key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="radio" name="correct-option" checked={checkpoint.correctAnswer === index} onChange={() => setCheckpoint((current) => ({ ...current, correctAnswer: index }))} /><span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => setCheckpoint((current) => ({ ...current, options: current.options.map((item, optionIndex) => optionIndex === index ? event.target.value : item) }))} placeholder={`Phương án ${index + 1}`} className="min-w-0 flex-1 text-sm outline-none" /></label>)}</div><label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Giải thích sau khi trả lời</span><textarea value={checkpoint.explanation} onChange={(event) => setCheckpoint((current) => ({ ...current, explanation: event.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 p-3 text-sm" /></label><button type="button" onClick={addCheckpoint} className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Thêm checkpoint tại {formatTime(checkpoint.timeSeconds)}</button>

        <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-black">Checkpoint đã tạo ({checkpoints.length})</h3>{checkpoints.length ? <div className="mt-3 space-y-2">{checkpoints.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><button type="button" onClick={() => { if (videoRef.current) { videoRef.current.currentTime = item.timeSeconds; void videoRef.current.play(); } }} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-600"><CirclePlay className="h-4 w-4" /></button><span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-black text-indigo-700">{formatTime(item.timeSeconds)}</span><p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{item.prompt}</p><button type="button" onClick={() => setCheckpoints((items) => items.filter((checkpointItem) => checkpointItem.id !== item.id))} aria-label="Xóa checkpoint" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <p className="mt-3 rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-400">Phát video tới đoạn cần kiểm tra rồi tạo checkpoint đầu tiên.</p>}</div>
      </section>

      {notice && <p className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</p>}
      <div className="flex flex-col justify-end gap-3 sm:flex-row"><button type="button" disabled={studio.mutating} onClick={() => void save("draft")} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu bản nháp</button><button type="button" disabled={studio.mutating} onClick={() => void save("published")} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white"><Video className="h-4 w-4" /> Xuất bản vào Kho tài liệu</button></div>
    </div>
  </div>;
}
