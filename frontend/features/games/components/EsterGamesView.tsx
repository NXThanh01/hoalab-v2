"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Calculator, CheckSquare2, FlaskConical, RotateCcw, Zap } from "lucide-react";
import type { EsterGameMode, EsterGameQuestion } from "@/shared/ester-games";
import { EsterGameRound } from "./EsterGameRound";

const modes = [
  { id: "speed", name: "Chọn nhanh", description: "Chọn một đáp án trong 30 giây.", icon: Zap, mark: "A / B / C / D", rounds: 8 },
  { id: "verdict", name: "Đúng hay sai?", description: "Phân loại bốn nhận định về một tình huống.", icon: CheckSquare2, mark: "Đ / S", rounds: 5 },
  { id: "calculation", name: "Tính nhẩm", description: "Tìm kết quả về khối lượng, số mol hoặc hiệu suất.", icon: Calculator, mark: "n = m/M", rounds: 6 },
  { id: "equation", name: "Viết phương trình", description: "Viết sản phẩm và cân bằng phản ứng.", icon: FlaskConical, mark: "→", rounds: 5 },
] as const;

type Mode = (typeof modes)[number];
type Pools = Record<EsterGameMode, EsterGameQuestion[]>;
type Session = { mode: Mode; questions: EsterGameQuestion[]; answers: boolean[]; id: number };

function randomRound(pool: EsterGameQuestion[], rounds: number) {
  const questions = [...pool];
  for (let index = questions.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[other]] = [questions[other], questions[index]];
  }
  return questions.slice(0, rounds);
}

export function EsterGamesView() {
  const [pools, setPools] = useState<Pools | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const nextId = useRef(0);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const round = session?.answers.length ?? 0;
  const finished = Boolean(session && round === session.questions.length);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/games/ester-lipid", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Không tải được bộ câu hỏi.");
        if (!controller.signal.aborted) setPools(data.pools);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(error instanceof TypeError ? "Không kết nối được với HóaLab." : "Không tải được bộ câu hỏi. Hãy thử lại.");
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => { if (finished) resultHeading.current?.focus(); }, [finished]);

  function start(mode: Mode, retry?: EsterGameQuestion[]) {
    const questions = retry ?? randomRound(pools?.[mode.id] ?? [], mode.rounds);
    if (questions.length) setSession({ mode, questions, answers: [], id: ++nextId.current });
  }

  return <main className="min-h-[calc(100vh-68px)] bg-[#f4f5f7] px-4 py-7 text-slate-950 sm:px-6 lg:ml-[232px] lg:px-7">
    <div className="mx-auto max-w-[1180px]">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold text-indigo-700">Game ôn tập · Hóa 12</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Ester – Lipid</h1>
        {!session && pools && <p className="mt-2 text-sm text-slate-600">
          {Object.values(pools).reduce((total, questions) => total + questions.length, 0)} câu hỏi · Có lời giải sau mỗi câu
        </p>}
      </header>

      {!session && <section aria-label="Các chế độ chơi" className="mt-6">
        {!pools && !loadError && <p role="status" className="text-sm text-slate-600">Đang tải câu hỏi…</p>}
        {loadError && <div className="flex flex-wrap items-center gap-4" role="alert">
          <p className="text-sm text-rose-700">{loadError}</p>
          <button type="button" onClick={() => { setLoadError(""); setReload((value) => value + 1); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold">Tải lại</button>
        </div>}
        {pools && Object.values(pools).every((items) => !items.length) && <p className="text-sm text-slate-600">Chưa có câu hỏi Ester – Lipid được xuất bản.</p>}
        {pools && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{modes.map((mode) => {
          const count = pools[mode.id].length;
          const Icon = mode.icon;
          return <button key={mode.id} type="button" disabled={!count} onClick={() => start(mode)}
            className="group flex min-h-44 min-w-0 flex-col items-start rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-indigo-700 motion-safe:hover:-translate-y-0.5 disabled:opacity-55">
            <span className="flex w-full items-center justify-between gap-2">
              <Icon aria-hidden className="h-5 w-5 text-indigo-700" />
              <span aria-hidden className="font-mono text-xs text-indigo-700">{mode.mark}</span>
            </span>
            <span className="mt-4 font-bold">{mode.name}</span>
            <span className="mt-1 flex-1 text-sm leading-6 text-slate-600">{mode.description}</span>
            <span className="mt-3 flex w-full items-center justify-between gap-2 text-sm font-semibold text-indigo-700">
              {count ? `${Math.min(count, mode.rounds)} câu/lượt` : "Chưa có câu hỏi"} <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </button>;
        })}</div>}
      </section>}

      {session && <section className="mx-auto mt-3 max-w-3xl" aria-label={session.mode.name}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => setSession(null)} className="flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-700">
            <ArrowLeft aria-hidden className="h-4 w-4" /> Chọn trò khác
          </button>
          <p className="text-sm font-semibold text-slate-600">{session.mode.name}</p>
        </div>
        {finished ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 tabIndex={-1} ref={resultHeading} className="text-2xl font-bold">Kết quả lượt chơi</h2>
            <p className="mt-3 text-lg text-slate-700"><strong className="text-3xl text-indigo-700">{session.answers.filter(Boolean).length}/{round}</strong> câu chính xác</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => start(session.mode)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold">
                <RotateCcw aria-hidden className="h-4 w-4" /> Lượt mới
              </button>
              {session.answers.includes(false) && <button type="button"
                onClick={() => start(session.mode, session.questions.filter((_, index) => !session.answers[index]))}
                className="min-h-11 rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-800">
                Ôn lại câu sai
              </button>}
            </div>
          </div>
        ) : (
          <EsterGameRound key={`${session.id}:${round}`} mode={session.mode.id} question={session.questions[round]} position={round + 1} total={session.questions.length}
            onNext={(correct) => setSession({ ...session, answers: [...session.answers, correct] })} />
        )}
      </section>}
    </div>
  </main>;
}
