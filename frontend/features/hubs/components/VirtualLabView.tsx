"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Beaker,
  BookOpenCheck,
  Check,
  ChevronRight,
  ClipboardCheck,
  Eye,
  FlaskConical,
  Gauge,
  Glasses,
  GraduationCap,
  Droplets,
  Flame,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { ChemicalNotation } from "@/frontend/components/atoms/ChemicalNotation";
import { virtualExperiments } from "@/frontend/features/hubs/data/virtual-lab.data";

const STAGES = ["An toàn", "Định lượng", "Thiết lập", "Phản ứng", "Báo cáo"];
const SAFETY_ITEMS = [
  { id: "glasses", label: "Đeo kính bảo hộ", icon: Glasses },
  { id: "gloves", label: "Đeo găng tay", icon: ShieldCheck },
  { id: "hood", label: "Bật tủ hút khí", icon: FlaskConical },
] as const;

type SafetyId = (typeof SAFETY_ITEMS)[number]["id"];

export function VirtualLabView() {
  const [selectedId, setSelectedId] = useState(virtualExperiments[0].id);
  const experiment = virtualExperiments.find((item) => item.id === selectedId) ?? virtualExperiments[0];
  const [stage, setStage] = useState(0);
  const [safety, setSafety] = useState<Record<SafetyId, boolean>>({ glasses: false, gloves: false, hood: false });
  const [reagentA, setReagentA] = useState(experiment.reagentA.initial);
  const [reagentB, setReagentB] = useState(experiment.reagentB.initial);
  const [temperature, setTemperature] = useState(experiment.temperature.initial);
  const [conditionEnabled, setConditionEnabled] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Hãy hoàn tất kiểm tra an toàn trước khi thao tác.");
  const [observations, setObservations] = useState<string[]>([]);
  const [reactionProgress, setReactionProgress] = useState(0);
  const reactionTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (reactionTimer.current !== null) window.clearInterval(reactionTimer.current);
  }, []);

  const safetyReady = Object.values(safety).every(Boolean);
  const yieldPercent = useMemo(() => {
    const actualRatio = reagentA / Math.max(reagentB, 0.1);
    const ratioScore = Math.max(0.45, 1 - Math.abs(actualRatio - experiment.optimalRatio) / Math.max(experiment.optimalRatio, 0.2));
    const temperatureScore = Math.max(0.5, 1 - Math.abs(temperature - experiment.temperature.optimal) / 70);
    const conditionScore = conditionEnabled ? 1 : 0.58;
    return Math.round(Math.min(96, 96 * ratioScore * temperatureScore * conditionScore));
  }, [conditionEnabled, experiment, reagentA, reagentB, temperature]);
  const polymerUnits = Math.max(3, Math.round(yieldPercent / 9));

  function resetLab(nextId = selectedId) {
    const next = virtualExperiments.find((item) => item.id === nextId) ?? virtualExperiments[0];
    setSelectedId(next.id);
    setStage(0);
    setSafety({ glasses: false, gloves: false, hood: false });
    setReagentA(next.reagentA.initial);
    setReagentB(next.reagentB.initial);
    setTemperature(next.temperature.initial);
    setConditionEnabled(false);
    setMistakes(0);
    setObservations([]);
    setReactionProgress(0);
    if (reactionTimer.current !== null) window.clearInterval(reactionTimer.current);
    setMessage("Hãy hoàn tất kiểm tra an toàn trước khi thao tác.");
  }

  function toggleSafety(id: SafetyId) {
    if (stage > 0) return;
    setSafety((current) => ({ ...current, [id]: !current[id] }));
  }

  function advance() {
    if (stage === 0 && !safetyReady) {
      setMistakes((value) => value + 1);
      setMessage("Chưa an toàn: cần kính, găng tay và tủ hút trước khi bắt đầu.");
      return;
    }
    if (stage === 0) {
      setStage(1);
      setObservations(["Đã hoàn thành kiểm tra an toàn và kiểm tra dụng cụ."]);
      setMessage("Điều chỉnh lượng hai hóa chất rồi xác nhận định lượng.");
      return;
    }
    if (stage === 1) {
      setStage(2);
      setObservations((items) => [...items, `Đã lấy ${reagentA} ${experiment.reagentA.unit} ${experiment.reagentA.name} và ${reagentB} ${experiment.reagentB.unit} ${experiment.reagentB.name}.`]);
      setMessage("Chọn điều kiện phản ứng và nhiệt độ phù hợp.");
      return;
    }
    if (stage === 2 && !conditionEnabled) {
      setMistakes((value) => value + 1);
      setMessage(`Thiếu điều kiện quan trọng: ${experiment.condition}.`);
      return;
    }
    if (stage === 2) {
      setStage(3);
      setReactionProgress(0);
      setObservations((items) => [...items, `${experiment.condition}; nhiệt độ đặt ở ${temperature} °C.`]);
      setMessage("Phản ứng đang diễn ra. Quan sát sự thay đổi trong bình.");
      const duration = experiment.visualization === "polymer" ? 7600 : 2200;
      const startedAt = Date.now();
      reactionTimer.current = window.setInterval(() => {
        const nextProgress = Math.min(100, Math.round(((Date.now() - startedAt) / duration) * 100));
        setReactionProgress(nextProgress);
        if (nextProgress >= 100) {
          if (reactionTimer.current !== null) window.clearInterval(reactionTimer.current);
          reactionTimer.current = null;
          setStage(4);
          setObservations((items) => [...items, experiment.observation]);
          setMessage("Mô phỏng hoàn tất. Báo cáo thí nghiệm đã được tạo.");
        }
      }, 100);
    }
  }

  const buttonLabel = stage === 0 ? "Xác nhận an toàn" : stage === 1 ? "Xác nhận định lượng" : stage === 2 ? "Bắt đầu phản ứng" : "Đang mô phỏng...";

  return (
    <main className="min-h-[calc(100vh-68px)] bg-[#eef2f7] px-4 py-6 sm:px-6 lg:ml-[232px] lg:px-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700"><Sparkles className="h-4 w-4" /> HóaLab Virtual Lab · Hóa học 12</div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Thực hành như thật. An toàn tuyệt đối.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Tự thiết kế điều kiện, quan sát hiện tượng và nhận báo cáo hiệu suất ngay trong phòng thí nghiệm số.</p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Điểm an toàn</p><p className="mt-1 text-xl font-black text-emerald-900">{Math.max(70, 100 - mistakes * 10)}<span className="text-xs">/100</span></p></div>
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Tiến trình</p><p className="mt-1 text-xl font-black text-indigo-900">{Math.round((stage / 4) * 100)}<span className="text-xs">%</span></p></div>
          </div>
        </header>

        <section className="mt-6 grid gap-5 2xl:grid-cols-[270px_minmax(0,1fr)_330px]">
          <aside className="order-2 space-y-3 2xl:order-1">
            <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">Danh mục thí nghiệm</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{virtualExperiments.length} bài</span></div>
              <div className="mt-3 space-y-2">
                {virtualExperiments.map((item, index) => (
                  <button key={item.id} onClick={() => resetLab(item.id)} className={`w-full rounded-2xl border p-3 text-left transition ${selectedId === item.id ? "border-indigo-300 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                    <div className="flex gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-black ${selectedId === item.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>0{index + 1}</span><span className="min-w-0"><span className="block text-xs font-extrabold leading-5 text-slate-800">{item.title}</span><span className="mt-1 flex gap-2 text-[10px] font-semibold text-slate-400"><span>{item.topic}</span><span>·</span><span>{item.duration}</span></span></span></div>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] bg-slate-900 p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-extrabold"><GraduationCap className="h-4 w-4 text-cyan-300" /> AI Lab Coach</div>
              <p className="mt-3 text-xs leading-5 text-slate-300">{experiment.visualization === "polymer" && stage < 2 ? "Muốn tạo mạch polymer dài, số mol hai monomer hai chức cần gần bằng nhau." : stage < 2 ? "Tỉ lệ mol phù hợp giúp hạn chế hóa chất dư và làm kết quả dễ quan sát hơn." : conditionEnabled ? `Nhiệt độ tối ưu gợi ý: khoảng ${experiment.temperature.optimal} °C.` : `Hãy xem lại vai trò của điều kiện: ${experiment.condition}.`}</p>
            </div>
          </aside>

          <section className="order-1 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-300/60 2xl:order-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-white">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Bàn thí nghiệm số</p><h2 className="mt-1 text-lg font-black">{experiment.title}</h2></div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200"><ChemicalNotation value={experiment.equation} /></div>
            </div>

            <div className={`relative min-h-[420px] overflow-hidden bg-gradient-to-br ${experiment.gradient}`}>
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:36px_36px]" />
              <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-md"><span className={`h-2 w-2 rounded-full ${stage === 3 ? "animate-pulse bg-amber-300" : stage === 4 ? "bg-emerald-300" : "bg-cyan-300"}`} /> {stage === 3 ? "PHẢN ỨNG ĐANG DIỄN RA" : stage === 4 ? "MÔ PHỎNG HOÀN TẤT" : "BÀN THÍ NGHIỆM SẴN SÀNG"}</div>
              <div className="absolute right-5 top-5 z-10 rounded-2xl border border-white/15 bg-black/20 p-3 text-white backdrop-blur-md"><p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Nhiệt độ</p><p className="mt-1 flex items-center gap-1 text-lg font-black"><Thermometer className="h-4 w-4 text-orange-300" /> {temperature} °C</p></div>

              {experiment.visualization === "polymer" ? (
                <PolymerSimulation stage={stage} units={polymerUnits} progress={reactionProgress} temperature={temperature} />
              ) : <div className="absolute inset-0 flex items-center justify-center pt-12">
                <div className="relative h-72 w-72">
                  <motion.div animate={stage === 3 ? { scale: [1, 1.14, 1], opacity: [0.25, 0.5, 0.25] } : {}} transition={{ repeat: Infinity, duration: 1.5 }} className={`absolute inset-10 rounded-full ${experiment.glow} opacity-25 blur-3xl`} />
                  <div className="absolute bottom-7 left-1/2 h-44 w-40 -translate-x-1/2 overflow-hidden rounded-b-[64px] border-x-4 border-b-4 border-white/60 bg-white/10 shadow-2xl backdrop-blur-sm">
                    <motion.div initial={false} animate={{ height: stage >= 1 ? `${Math.min(86, 38 + (reagentA + reagentB) * 2)}%` : "18%" }} className={`absolute inset-x-1 bottom-1 rounded-b-[58px] bg-gradient-to-t ${experiment.liquid}`} />
                    <AnimatePresence>{stage >= 3 && Array.from({ length: 14 }).map((_, index) => <motion.span key={index} initial={{ y: 125, opacity: 0 }} animate={{ y: -20 - (index % 4) * 12, opacity: [0, 0.9, 0] }} transition={{ duration: 1.4 + (index % 3) * 0.25, repeat: Infinity, delay: index * 0.11 }} className="absolute bottom-3 rounded-full border border-white/60 bg-white/50" style={{ left: `${12 + (index * 23) % 120}px`, width: `${5 + index % 4}px`, height: `${5 + index % 4}px` }} />)}</AnimatePresence>
                  </div>
                  <div className="absolute bottom-[181px] left-1/2 h-20 w-16 -translate-x-1/2 border-x-4 border-white/60 bg-white/10" />
                  <div className="absolute bottom-[254px] left-1/2 h-3 w-24 -translate-x-1/2 rounded-full border-2 border-white/70 bg-white/20" />
                  {stage >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.85, 0.2], y: [-2, -14, -2] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute bottom-0 left-1/2 h-8 w-28 -translate-x-1/2 rounded-[50%] bg-orange-400/70 blur-md" />}
                </div>
              </div>}

              <AnimatePresence>{stage === 4 && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-slate-950/75 p-4 text-white shadow-xl backdrop-blur-xl"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400 text-emerald-950"><Eye className="h-5 w-5" /></span><div><p className="text-xs font-black">Hiện tượng quan sát được</p><p className="mt-1 text-xs leading-5 text-slate-300">{experiment.observation}</p></div></div></motion.div>}</AnimatePresence>
            </div>

            <div className="border-t border-white/10 bg-slate-950 p-4 sm:p-5">
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">{STAGES.map((item, index) => <div key={item} className={`rounded-xl px-1 py-2 text-center text-[9px] font-bold sm:text-[10px] ${index < stage ? "bg-emerald-400/15 text-emerald-300" : index === stage ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-500"}`}><span className="mx-auto mb-1 grid h-5 w-5 place-items-center rounded-full border border-current">{index < stage ? <Check className="h-3 w-3" /> : index + 1}</span>{item}</div>)}</div>
              <div className={`mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-xs ${message.startsWith("Chưa") || message.startsWith("Thiếu") ? "border-amber-400/30 bg-amber-400/10 text-amber-200" : "border-white/10 bg-white/5 text-slate-300"}`}>{message.startsWith("Chưa") || message.startsWith("Thiếu") ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Lightbulb className="h-4 w-4 shrink-0 text-cyan-300" />}<span>{message}</span></div>
            </div>
          </section>

          <aside className="order-3 space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><h2 className="text-sm font-black text-slate-900">Bảng điều khiển</h2><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{experiment.level}</span></div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{experiment.objective}</p>

              <div className="mt-5"><p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">01 · Kiểm tra an toàn</p><div className="space-y-2">{SAFETY_ITEMS.map((item) => <button key={item.id} onClick={() => toggleSafety(item.id)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${safety[item.id] ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-500 hover:border-indigo-200"}`}><span className={`grid h-7 w-7 place-items-center rounded-lg ${safety[item.id] ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>{safety[item.id] ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}</span>{item.label}</button>)}</div></div>

              <div className={`mt-5 space-y-4 transition ${stage < 1 || stage > 2 ? "pointer-events-none opacity-45" : ""}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">02 · Hóa chất & điều kiện</p>
                {[[experiment.reagentA, reagentA, setReagentA], [experiment.reagentB, reagentB, setReagentB]].map(([reagent, value, setter]) => { const item = reagent as typeof experiment.reagentA; const numericValue = value as number; const update = setter as (value: number) => void; return <label key={item.name} className="block"><span className="mb-2 flex justify-between text-xs font-bold text-slate-700"><span>{item.name}</span><span className="text-indigo-600">{numericValue} {item.unit}</span></span><input aria-label={`Lượng ${item.name}`} type="range" min={item.min} max={item.max} value={numericValue} onChange={(event) => update(Number(event.target.value))} className="w-full accent-indigo-600" /></label>; })}
                <label className="block"><span className="mb-2 flex justify-between text-xs font-bold text-slate-700"><span>Nhiệt độ</span><span className="text-orange-600">{temperature} °C</span></span><input aria-label="Nhiệt độ phản ứng" type="range" min={experiment.temperature.min} max={experiment.temperature.max} value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} className="w-full accent-orange-500" /></label>
                <button onClick={() => setConditionEnabled((value) => !value)} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-bold transition ${conditionEnabled ? "border-indigo-300 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-600"}`}><span className="pr-3">{experiment.condition}</span><span className={`h-6 w-11 rounded-full p-1 transition ${conditionEnabled ? "bg-indigo-600" : "bg-slate-200"}`}><span className={`block h-4 w-4 rounded-full bg-white shadow transition ${conditionEnabled ? "translate-x-5" : ""}`} /></span></button>
              </div>

              {stage < 4 ? <button disabled={stage === 3} onClick={advance} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-xs font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-50"><Beaker className="h-4 w-4" /> {buttonLabel}<ChevronRight className="h-4 w-4" /></button> : <button onClick={() => resetLab()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-xs font-extrabold text-white"><RotateCcw className="h-4 w-4" /> Thực hiện lại</button>}
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-black text-slate-900"><ClipboardCheck className="h-4 w-4 text-indigo-600" /> Sổ thực hành</h2>{stage === 4 && <span className="text-xs font-black text-emerald-600">Đã lưu</span>}</div>
              {stage < 4 ? <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-5 text-center"><BookOpenCheck className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-2 text-xs leading-5 text-slate-400">Các quan sát sẽ được ghi tự động trong quá trình mô phỏng.</p></div> : <div className="mt-4"><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-indigo-50 p-3"><Gauge className="h-4 w-4 text-indigo-600" /><p className="mt-2 text-[9px] font-bold uppercase text-indigo-500">{experiment.resultLabel ?? "Hiệu suất mô phỏng"}</p><p className="text-2xl font-black text-indigo-900">{yieldPercent}%</p>{experiment.visualization === "polymer" && <p className="mt-1 text-[9px] font-bold text-indigo-500">≈ {polymerUnits} mắt xích mô phỏng</p>}</div><div className="rounded-xl bg-emerald-50 p-3"><ShieldCheck className="h-4 w-4 text-emerald-600" /><p className="mt-2 text-[9px] font-bold uppercase text-emerald-600">An toàn</p><p className="text-2xl font-black text-emerald-900">{Math.max(70, 100 - mistakes * 10)}</p></div></div><div className="mt-3 space-y-2">{observations.map((item, index) => <div key={`${item}-${index}`} className="flex gap-2 text-[11px] leading-4 text-slate-500"><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-2.5 w-2.5" /></span>{item}</div>)}</div><div className="mt-3 rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Kết luận</p><p className="mt-1 text-xs leading-5 text-slate-600">{experiment.conclusion}</p></div></div>}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function PolymerSimulation({ stage, units, progress, temperature }: { stage: number; units: number; progress: number; temperature: number }) {
  const activeProgress = stage === 4 ? 100 : progress;
  const formedUnits = stage < 3 ? 0 : Math.max(1, Math.round((activeProgress / 100) * units));
  const waterCount = stage < 3 ? 0 : Math.max(1, Math.round((activeProgress / 100) * Math.max(1, units - 1)));
  const moleculeSpeed = Math.max(0.65, 1.7 - (temperature - 180) / 140);
  const monomers = [
    [275, 166], [325, 134], [378, 174], [248, 212], [352, 222], [405, 203],
    [300, 244], [421, 148], [261, 125], [392, 246], [332, 190], [438, 230],
  ] as const;

  return (
    <div className="absolute inset-0 z-[1] flex items-center justify-center px-3 pb-3 pt-16 text-white sm:px-5">
      <div className="relative h-[330px] w-full max-w-4xl overflow-hidden rounded-[26px] border border-white/15 bg-slate-950/45 shadow-2xl backdrop-blur-md">
        <div className="absolute left-4 top-4 z-10 flex gap-2">
          <MetricPill label="Tiến độ" value={`${activeProgress}%`} tone="cyan" />
          <MetricPill label="Liên kết amide" value={`${Math.max(0, formedUnits - 1)}`} tone="amber" />
          <MetricPill label="H₂O đã tách" value={`${waterCount}`} tone="blue" />
        </div>

        <svg viewBox="0 0 760 330" className="h-full w-full" role="img" aria-label="Mô phỏng bình phản ứng trùng ngưng nylon-6,6">
          <defs>
            <linearGradient id="reactorGlass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
              <stop offset="0.45" stopColor="#67e8f9" stopOpacity="0.08" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="reactionLiquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fcd34d" stopOpacity="0.72" />
              <stop offset="1" stopColor="#f97316" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#64748b" /><stop offset="0.5" stopColor="#e2e8f0" /><stop offset="1" stopColor="#475569" />
            </linearGradient>
            <filter id="softGlow"><feGaussianBlur stdDeviation="5" /></filter>
          </defs>

          <path d="M0 286 H760 V330 H0Z" fill="#111827" opacity="0.9" />
          <path d="M0 286 H760" stroke="#64748b" strokeOpacity="0.5" strokeWidth="2" />

          {/* Motor and stirring system */}
          <rect x="310" y="46" width="106" height="38" rx="10" fill="url(#metal)" stroke="#e2e8f0" strokeOpacity="0.5" />
          <circle cx="328" cy="65" r="7" fill={stage === 3 ? "#34d399" : "#94a3b8"} />
          <text x="345" y="69" fill="#0f172a" fontSize="11" fontWeight="800">MÁY KHUẤY</text>
          <rect x="357" y="82" width="10" height="126" rx="5" fill="url(#metal)" />
          <motion.g style={{ transformOrigin: "362px 205px" }} animate={{ rotate: stage === 3 ? 360 : 0 }} transition={{ repeat: stage === 3 ? Infinity : 0, duration: moleculeSpeed, ease: "linear" }}>
            <rect x="320" y="201" width="84" height="8" rx="4" fill="#cbd5e1" />
            <circle cx="362" cy="205" r="9" fill="#f8fafc" />
          </motion.g>

          {/* Glass reactor */}
          <path d="M236 94 L236 226 Q236 272 283 272 H441 Q488 272 488 226 V94Z" fill="url(#reactorGlass)" stroke="#e0f2fe" strokeWidth="4" strokeOpacity="0.75" />
          <path d="M246 160 V227 Q246 261 284 261 H440 Q478 261 478 227 V160Z" fill="url(#reactionLiquid)" opacity={stage >= 1 ? 0.78 : 0.34} />
          <ellipse cx="362" cy="160" rx="116" ry="12" fill="#fde68a" opacity={stage >= 1 ? 0.52 : 0.18} />
          <path d="M226 95 H498" stroke="#e0f2fe" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <rect x="266" y="86" width="42" height="18" rx="8" fill="#cbd5e1" stroke="#f8fafc" />
          <rect x="414" y="86" width="42" height="18" rx="8" fill="#cbd5e1" stroke="#f8fafc" />

          {/* Monomers moving in the reaction medium */}
          {monomers.map(([cx, cy], index) => {
            const conversionPoint = ((index + 1) / monomers.length) * 100;
            const converted = stage >= 3 && activeProgress >= conversionPoint;
            const acid = index % 2 === 0;
            return (
              <motion.g key={`${cx}-${cy}`} animate={{ x: [0, acid ? 10 : -12, acid ? -7 : 8, 0], y: [0, -8, 7, 0], opacity: converted ? 0.08 : 1, scale: converted ? 0.35 : 1 }} transition={{ repeat: converted ? 0 : Infinity, duration: moleculeSpeed + (index % 3) * 0.18, delay: index * 0.05 }}>
                <circle cx={cx} cy={cy} r="14" fill={acid ? "#fb7185" : "#22d3ee"} stroke="#fff" strokeOpacity="0.7" strokeWidth="2" />
                <text x={cx} y={cy + 3} textAnchor="middle" fill="#fff" fontSize="8" fontWeight="900">{acid ? "COOH" : "NH₂"}</text>
              </motion.g>
            );
          })}

          {/* Growing polymer chain */}
          {stage >= 3 && Array.from({ length: formedUnits }).map((_, index) => {
            const x = 270 + (index % 6) * 37;
            const y = 235 - Math.floor(index / 6) * 32;
            const acid = index % 2 === 0;
            return <motion.g key={index} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", delay: 0.05 }}>
              {index > 0 && <line x1={index % 6 === 0 ? 270 : x - 23} y1={index % 6 === 0 ? y + 32 : y} x2={x - 12} y2={y} stroke="#fde047" strokeWidth="4" strokeLinecap="round" />}
              <circle cx={x} cy={y} r="13" fill={acid ? "#e11d48" : "#0891b2"} stroke="#fef08a" strokeWidth="2" />
              <text x={x} y={y + 3} textAnchor="middle" fill="white" fontSize="7" fontWeight="900">{acid ? "CO" : "NH"}</text>
            </motion.g>;
          })}

          {/* Heated plate and heat waves */}
          <rect x="250" y="276" width="224" height="18" rx="8" fill="#334155" stroke="#94a3b8" />
          <rect x="274" y="282" width="176" height="5" rx="3" fill={stage === 3 ? "#fb923c" : "#64748b"} />
          {stage === 3 && [294, 334, 374, 414].map((x, index) => <motion.path key={x} d={`M${x} 275 Q${x - 8} 263 ${x} 250 Q${x + 8} 238 ${x} 226`} fill="none" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" animate={{ opacity: [0.15, 0.9, 0.15], y: [7, -3, 7] }} transition={{ repeat: Infinity, duration: 1.2, delay: index * 0.15 }} />)}

          {/* Condenser and water collector */}
          <path d="M456 95 C520 95 514 126 548 126 H582" fill="none" stroke="#e0f2fe" strokeWidth="12" strokeLinecap="round" opacity="0.75" />
          <path d="M456 95 C520 95 514 126 548 126 H582" fill="none" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
          <rect x="570" y="105" width="24" height="72" rx="10" fill="url(#reactorGlass)" stroke="#bae6fd" strokeWidth="3" />
          <path d="M582 176 V213" stroke="#bae6fd" strokeWidth="7" strokeLinecap="round" />
          <path d="M543 217 L621 217 L610 279 H554Z" fill="url(#reactorGlass)" stroke="#e0f2fe" strokeWidth="3" />
          <path d="M551 253 Q582 245 614 253 L610 279 H554Z" fill="#38bdf8" opacity="0.55" />
          {stage >= 3 && Array.from({ length: Math.min(7, waterCount) }).map((_, index) => <motion.circle key={index} cx="582" cy="128" r="5" fill="#7dd3fc" stroke="#e0f2fe" animate={{ cy: [126, 180, 242], opacity: [0, 1, 1, 0] }} transition={{ repeat: Infinity, duration: 2.3, delay: index * 0.38 }} />)}

          {/* Instrument labels */}
          <g opacity="0.9"><rect x="31" y="215" width="154" height="65" rx="15" fill="#0f172a" stroke="#475569" /><text x="48" y="237" fill="#94a3b8" fontSize="9" fontWeight="800">NHIỆT ĐỘ LÒ</text><text x="48" y="263" fill="#fb923c" fontSize="25" fontWeight="900">{temperature} °C</text><circle cx="161" cy="248" r="10" fill={stage === 3 ? "#fb923c" : "#475569"} filter={stage === 3 ? "url(#softGlow)" : undefined} /></g>
          <g opacity="0.9"><rect x="615" y="55" width="116" height="56" rx="15" fill="#0f172a" stroke="#475569" /><text x="631" y="77" fill="#94a3b8" fontSize="9" fontWeight="800">TÁCH NƯỚC</text><text x="631" y="98" fill="#7dd3fc" fontSize="16" fontWeight="900">{waterCount} H₂O</text></g>
        </svg>

        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 backdrop-blur-md">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-400/15 text-orange-300">{stage === 3 ? <Flame className="h-4 w-4 animate-pulse" /> : <Droplets className="h-4 w-4" />}</div>
          <div className="min-w-0 flex-1"><div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-white/60"><span>{stage < 3 ? "Hệ phản ứng đang chờ thiết lập" : stage === 3 ? "Đang trùng ngưng · Va chạm và tạo liên kết" : "Phản ứng đã đạt cân bằng mô phỏng"}</span><span>{activeProgress}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-orange-400" animate={{ width: `${activeProgress}%` }} /></div></div>
        </div>
      </div>
    </div>
  );
}

function MetricPill({ label, value, tone }: { label: string; value: string; tone: "cyan" | "amber" | "blue" }) {
  const tones = { cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-200", amber: "border-amber-300/20 bg-amber-400/10 text-amber-200", blue: "border-blue-300/20 bg-blue-400/10 text-blue-200" };
  return <div className={`rounded-xl border px-3 py-2 backdrop-blur-md ${tones[tone]}`}><p className="text-[8px] font-bold uppercase tracking-wider opacity-70">{label}</p><p className="mt-0.5 text-sm font-black">{value}</p></div>;
}
