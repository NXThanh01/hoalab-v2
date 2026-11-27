"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, CirclePlay, Clock3, LoaderCircle, Plus, Save, Trash2, Upload, Video } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { VIDEO_MAX_BYTES, videoSourceForLesson } from "@/shared/lesson-video";
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
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const [checkpoints, setCheckpoints] = useState<VideoCheckpointRecord[]>(savedLesson?.checkpoints ?? []);
  const [checkpoint, setCheckpoint] = useState(emptyCheckpoint);
  const [notice, setNotice] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { if (localUrl) URL.revokeObjectURL(localUrl); }, [localUrl]);

  function chooseLesson(id: string) {
    if (uploading || studio.mutating) return;
    const stored = studio.lessons.find((item) => item.id === id);
    setLessonId(id);
    setVideoUrl(stored?.videoUrl ?? "");
    setCheckpoints(stored?.checkpoints ?? []);
    setCheckpoint(emptyCheckpoint());
    setLocalUrl("");
    setDuration(null);
    setNotice("");
  }

  async function selectLocalVideo(file?: File) {
    if (!file || uploading) return;
    const extension = /\.(mp4|webm)$/i.exec(file.name)?.[1].toLowerCase();
    if (!extension || !file.size || file.size > VIDEO_MAX_BYTES) {
      setNotice("Chọn video MP4 hoặc WebM có dung lượng tối đa 100 MB.");
      return;
    }
    setUploading(true);
    setUploadPercent(0);
    setNotice("");
    try {
      const blob = await upload(`lessons/${lessonId}/${crypto.randomUUID()}.${extension}`, file, {
        access: "private",
        contentType: `video/${extension}`,
        handleUploadUrl: "/api/admin/lessons/video-upload",
        multipart: file.size > 10 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setUploadPercent(Math.round(percentage)),
      });
      setDuration(null);
      setLocalUrl(URL.createObjectURL(file));
      setVideoUrl(`blob:${blob.pathname}`);
      setNotice("Đã tải xong. Lưu bản nháp hoặc xuất bản để gắn video vào bài.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không tải được video. Hãy thử lại.");
    } finally {
      setUploading(false);
    }
  }

  function captureTime() {
    setCheckpoint((current) => ({ ...current, timeSeconds: Math.floor(videoRef.current?.currentTime ?? 0) }));
  }

  function addCheckpoint() {
    if (checkpoints.length >= 30 || checkpoints.some((item) => item.timeSeconds === checkpoint.timeSeconds)) {
      setNotice("Mỗi bài có tối đa 30 checkpoint và các mốc phải khác nhau.");
      return;
    }
    if (!Number.isInteger(checkpoint.timeSeconds) || checkpoint.timeSeconds < 0 || (duration !== null && checkpoint.timeSeconds >= duration)) {
      setNotice("Mốc checkpoint phải nằm trong thời lượng video.");
      return;
    }
    if (checkpoint.prompt.trim().length < 5 || checkpoint.options.some((item) => !item.trim())) {
      setNotice("Nhập câu hỏi và đủ 4 phương án trước khi thêm checkpoint."); return;
    }
    setCheckpoints((items) => [...items, checkpoint].sort((a, b) => a.timeSeconds - b.timeSeconds));
    setCheckpoint(emptyCheckpoint());
    setNotice("Đã thêm checkpoint vào bản nháp. Bấm Lưu để ghi vào hệ thống.");
  }

  async function save(status: "draft" | "published") {
    if (uploading) return;
    if (status === "published" && !videoUrl.trim()) { setNotice("Hãy tải video hoặc nhập liên kết HTTPS trước khi xuất bản."); return; }
    if (duration !== null && checkpoints.some((item) => item.timeSeconds >= duration)) {
      setNotice("Có checkpoint nằm ngoài thời lượng video. Hãy chỉnh lại trước khi lưu.");
      return;
    }
    try {
      await studio.saveLesson({ id: curriculumLesson.id, gradeLevel: 12, textbookSeries: "Kết nối tri thức", chapterId: curriculumLesson.chapterId, lessonNumber: curriculumLesson.number, title: curriculumLesson.title, videoUrl, status, checkpoints });
      setNotice(status === "published" ? "Đã xuất bản bài giảng vào Kho tài liệu." : "Đã lưu bản nháp bài giảng.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Chưa lưu được bài giảng."); }
  }

  return <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
  <aside className="self-start rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-24"><div className="mb-4"><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Kho tài liệu</p><h2 className="mt-1 text-xl font-black">Bài giảng Hóa 12</h2><p className="mt-1 text-xs leading-5 text-slate-500">Chọn bài theo SGK để gắn video và checkpoint.</p></div><div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">{grade12Curriculum.map((chapter) => <div key={chapter.id}><p className="mb-1.5 px-2 text-xs font-bold text-slate-400">Chương {chapter.number}. {chapter.title}</p>{chapter.lessons.map((item) => { const saved = studio.lessons.find((lesson) => lesson.id === item.id); return <button key={item.id} type="button" onClick={() => chooseLesson(item.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${lessonId === item.id ? "bg-indigo-600 text-white" : "hover:bg-slate-50"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${lessonId === item.id ? "bg-white/15" : "bg-slate-100 text-slate-500"}`}>{item.number}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold">{item.title}</span>{saved?.status === "published" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}</button>; })}</div>)}</div></aside>

    <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Bài {curriculumLesson.number} · {curriculumLesson.chapterTitle}</p><h2 className="mt-1 text-2xl font-black text-slate-950">{curriculumLesson.title}</h2></div><span className={`self-start rounded-full px-3 py-1.5 text-xs font-bold ${savedLesson?.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{savedLesson?.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="block min-w-0">
          <span className="mb-1.5 block text-sm font-medium">Liên kết video HTTPS</span>
          <input value={videoUrl.startsWith("blob:") ? "" : videoUrl} disabled={uploading} onChange={(event) => { setVideoUrl(event.target.value); setLocalUrl(""); setDuration(null); }} placeholder={videoUrl.startsWith("blob:") ? "Đang dùng video đã tải lên" : "https://…/video.mp4"} className="input-admin min-h-11" />
        </label>
        <label className={`relative flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 focus-within:ring-2 focus-within:ring-blue-600 ${uploading ? "opacity-60" : "cursor-pointer hover:bg-slate-50"}`}>
          <Upload className="h-4 w-4" aria-hidden="true" /> {uploading ? "Đang tải video…" : "Tải video từ máy"}
          <input type="file" accept=".mp4,.webm,video/mp4,video/webm" disabled={uploading || studio.mutating} className="sr-only" onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void selectLocalVideo(file); }} />
        </label>
      </div>
      <p className="mt-2 text-sm text-slate-500">MP4 hoặc WebM, tối đa 100 MB.</p>
      {uploading && <div className="mt-3"><label className="block text-sm" htmlFor="lesson-upload-progress">Tiến độ tải: {uploadPercent}%</label><progress id="lesson-upload-progress" value={uploadPercent} max={100} className="w-full" /></div>}
      {videoUrl || localUrl ? <video key={localUrl || videoUrl} ref={videoRef} src={localUrl || videoSourceForLesson(videoUrl, lessonId)} controls playsInline preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onError={() => setNotice("Không phát được video. Kiểm tra định dạng hoặc liên kết trực tiếp.")} className="mt-4 aspect-video w-full rounded-2xl bg-slate-950" /> : <div className="mt-4 grid aspect-video place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50"><p className="text-sm text-slate-600">Chưa có video</p></div>}</section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Tương tác trong video</p><h2 className="mt-1 text-xl font-black">Tạo checkpoint</h2></div><button type="button" onClick={captureTime} disabled={!videoUrl && !localUrl} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Clock3 className="h-4 w-4" /> Lấy thời điểm hiện tại</button></div><div className="mt-5 grid gap-4 lg:grid-cols-[150px_1fr]"><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Thời điểm (giây)</span><input type="number" min="0" value={checkpoint.timeSeconds} onChange={(event) => setCheckpoint((current) => ({ ...current, timeSeconds: Number(event.target.value) }))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">Câu hỏi hiển thị</span><input value={checkpoint.prompt} onChange={(event) => setCheckpoint((current) => ({ ...current, prompt: event.target.value }))} placeholder="Ví dụ: Sản phẩm của phản ứng xà phòng hóa là gì?" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{checkpoint.options.map((option, index) => <label key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input type="radio" name="correct-option" checked={checkpoint.correctAnswer === index} onChange={() => setCheckpoint((current) => ({ ...current, correctAnswer: index }))} /><span className="text-xs font-bold text-slate-400">{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => setCheckpoint((current) => ({ ...current, options: current.options.map((item, optionIndex) => optionIndex === index ? event.target.value : item) }))} placeholder={`Phương án ${index + 1}`} className="min-w-0 flex-1 text-sm outline-none" /></label>)}</div><label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Giải thích sau khi trả lời</span><textarea value={checkpoint.explanation} onChange={(event) => setCheckpoint((current) => ({ ...current, explanation: event.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 p-3 text-sm" /></label><button type="button" onClick={addCheckpoint} className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Thêm checkpoint tại {formatTime(checkpoint.timeSeconds)}</button>

        <div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-black">Checkpoint đã tạo ({checkpoints.length})</h3>{checkpoints.length ? <div className="mt-3 space-y-2">{checkpoints.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><button type="button" onClick={() => { if (videoRef.current) { videoRef.current.currentTime = item.timeSeconds; void videoRef.current.play(); } }} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-600"><CirclePlay className="h-4 w-4" /></button><span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-black text-indigo-700">{formatTime(item.timeSeconds)}</span><p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{item.prompt}</p><button type="button" onClick={() => setCheckpoints((items) => items.filter((checkpointItem) => checkpointItem.id !== item.id))} aria-label="Xóa checkpoint" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>)}</div> : <p className="mt-3 rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-400">Phát video tới đoạn cần kiểm tra rồi tạo checkpoint đầu tiên.</p>}</div>
      </section>

    {notice && <p role="status" className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{notice}</p>}
      <div className="flex flex-col justify-end gap-3 sm:flex-row"><button type="button" disabled={uploading || studio.mutating} onClick={() => void save("draft")} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700">{studio.mutating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Lưu bản nháp</button><button type="button" disabled={uploading || studio.mutating} onClick={() => void save("published")} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white"><Video className="h-4 w-4" /> Xuất bản vào Kho tài liệu</button></div>
    </div>
  </div>;
}
