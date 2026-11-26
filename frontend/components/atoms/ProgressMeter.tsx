type ProgressMeterProps = {
  value: number;
  label: string;
  showValue?: boolean;
  className?: string;
};

export function ProgressMeter({ value, label, showValue = false, className }: ProgressMeterProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        {showValue && <span className="font-black text-indigo-600">{Math.round(safeValue)}%</span>}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(safeValue)}>
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-[width] duration-500" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
