"use client";

import { useRef, useState } from "react";
import type { VideoCheckpointRecord } from "@/frontend/features/admin/model/admin.types";

export type PublishedLessonVideo = { videoUrl: string; checkpoints: VideoCheckpointRecord[] };

export function PublishedVideoLesson({ title, lesson, onBack }: {
  title: string;
  lesson: PublishedLessonVideo;
  onBack: () => void;
}) {
  const player = useRef<HTMLVideoElement>(null);
  const completed = useRef(new Set<string>());
  const pending = useRef<VideoCheckpointRecord | null>(null);
  const [active, setActive] = useState<VideoCheckpointRecord | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [mediaError, setMediaError] = useState("");
  const [finished, setFinished] = useState(false);

  function checkTime(video: HTMLVideoElement) {
    if (pending.current) {
      video.pause();
      return;
    }
    const checkpoint = lesson.checkpoints.find((item) =>
      item.timeSeconds <= video.currentTime && !completed.current.has(item.id));
    if (!checkpoint) return;
    pending.current = checkpoint;
    video.pause();
    if (Math.abs(video.currentTime - checkpoint.timeSeconds) > 0.25) video.currentTime = checkpoint.timeSeconds;
    setSelected(null);
    setFeedback("");
    setActive(checkpoint);
  }

  function checkAnswer() {
    if (!active || selected === null) return;
    if (selected !== active.correctAnswer) {
      setFeedback(`Chưa đúng. ${active.explanation || "Hãy chọn một phương án khác."}`);
      return;
    }
    completed.current.add(active.id);
    pending.current = null;
    setActive(null);
    void player.current?.play().catch(() => undefined);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[232px]">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={onBack} className="min-h-11 text-sm font-semibold text-blue-800 underline underline-offset-4">Về Kho tài liệu</button>
        <h1 className="mb-4 break-words text-2xl font-bold sm:text-3xl">{title}</h1>
        <video ref={player} src={lesson.videoUrl} controls={!active} disablePictureInPicture playsInline preload="metadata"
          onTimeUpdate={(event) => checkTime(event.currentTarget)}
          onSeeked={(event) => checkTime(event.currentTarget)}
          onPlay={(event) => { setFinished(false); checkTime(event.currentTarget); }}
          onEnded={(event) => {
            checkTime(event.currentTarget);
            setFinished(completed.current.size === lesson.checkpoints.length);
          }}
          onError={() => setMediaError("Không phát được video. Hãy quay về Kho tài liệu và mở lại bài.")}
          className="aspect-video w-full rounded-2xl bg-slate-950"
        />
        {mediaError && <p role="alert" className="mt-3 text-sm text-rose-700">{mediaError}</p>}
        {active && <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Câu hỏi tại {Math.floor(active.timeSeconds / 60)}:{String(active.timeSeconds % 60).padStart(2, "0")}</h2>
          <p className="mt-2 break-words">{active.prompt}</p>
          <fieldset className="mt-3 grid gap-2">
            <legend className="sr-only">Chọn một đáp án</legend>
            {active.options.map((option, index) => <label key={index} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-3 py-2">
              <input type="radio" name="lesson-answer" checked={selected === index} onChange={() => { setSelected(index); setFeedback(""); }} />
              <span className="min-w-0 break-words">{option}</span>
            </label>)}
          </fieldset>
          {feedback && <p role="status" className="mt-3 text-sm text-rose-700">{feedback}</p>}
          <button type="button" disabled={selected === null} onClick={checkAnswer} className="mt-4 min-h-11 w-full rounded-xl bg-slate-900 px-4 text-white disabled:opacity-50 sm:w-auto">Kiểm tra đáp án</button>
        </section>}
        {finished && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-800">Đã xem hết video và hoàn thành các câu hỏi.</p>}
      </div>
    </main>
  );
}
