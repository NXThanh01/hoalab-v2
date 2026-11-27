import { CircleHelp } from "lucide-react";

export function GuideButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label="Mở hướng dẫn" aria-haspopup="dialog" title="Hướng dẫn sử dụng"
    className="grid size-11 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-blue-700">
    <CircleHelp aria-hidden className="size-5" />
  </button>;
}
