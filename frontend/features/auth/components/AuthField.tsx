"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type Ref } from "react";

export function AuthField({ label, value, onChange, error, password, autoComplete, inputRef, describedBy }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  password?: boolean;
  autoComplete: string;
  inputRef?: Ref<HTMLInputElement>;
  describedBy?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">{label}</label>
    <div className="relative">
      <input id={id} ref={inputRef} type={password && !visible ? "password" : "text"} autoCapitalize="none" spellCheck={false}
        autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.currentTarget.value)}
        aria-invalid={Boolean(error) || undefined} aria-describedby={[error && `${id}-error`, describedBy].filter(Boolean).join(" ") || undefined}
        className={`min-h-12 w-full rounded-xl border bg-white px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${password ? "pr-13" : ""} ${error ? "border-rose-600" : "border-slate-300"}`}
      />
      {password && <button type="button" onClick={() => setVisible((value) => !value)} aria-label={`${visible ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`} aria-pressed={visible}
        className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-700">
        {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
      </button>}
    </div>
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-rose-700">{error}</p>}
  </div>;
}
