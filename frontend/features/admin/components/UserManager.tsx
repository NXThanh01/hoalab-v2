"use client";

import { useEffect, useRef, useState } from "react";

type Account = {
  id: string;
  loginId: string;
  role: "admin" | "user";
  status: "active" | "suspended";
  lastLoginAt: string | null;
  mustChangePassword: boolean;
  isSelf: boolean;
};
type ResetResult = { temporaryPassword: string; expiresAt: string };
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

export function UserManager() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [rows, setRows] = useState<Account[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<Account | null>(null);
  const [result, setResult] = useState<ResetResult | null>(null);
  const [resetError, setResetError] = useState("");
  const [copyNote, setCopyNote] = useState("");
  const [busy, setBusy] = useState(false);
  const resetting = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const secretInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ q: query, status, page: String(page) });
        const response = await fetch(`/api/admin/users?${params}`, { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error(data.error ?? "Chưa tải được danh sách người dùng.");
        setRows(data.users);
        setHasNext(data.hasNext);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Chưa tải được danh sách người dùng.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [page, query, revision, status]);

  function openReset(user: Account) {
    setTarget(user);
    setResult(null);
    setResetError("");
    setCopyNote("");
    dialog.current?.showModal();
  }

  async function reset() {
    if (!target || resetting.current) return;
    resetting.current = true;
    setBusy(true);
    setResetError("");
    try {
      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: target.id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Chưa đặt lại được mật khẩu.");
      setResult(body);
      setRevision((value) => value + 1);
    } catch (failure) {
      setResetError(failure instanceof Error ? failure.message : "Chưa đặt lại được mật khẩu.");
    } finally {
      resetting.current = false;
      setBusy(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
      setCopyNote("Đã sao chép mật khẩu tạm.");
    } catch {
      secretInput.current?.focus();
      secretInput.current?.select();
      setCopyNote("Hãy dùng lệnh sao chép của thiết bị.");
    }
  }

  return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="users-title">
    <h2 id="users-title" className="text-2xl font-semibold">Quản lý người dùng</h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
      <label><span className="mb-1 block text-sm font-medium">Tìm theo ID đăng nhập</span>
        <input value={query} maxLength={150} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} className="input-admin min-h-11" type="search" />
      </label>
      <label><span className="mb-1 block text-sm font-medium">Trạng thái tài khoản</span>
        <select value={status} onChange={(event) => { setStatus(event.currentTarget.value); setPage(1); }} className="input-admin min-h-11">
          <option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="suspended">Tạm khóa</option>
        </select>
      </label>
    </div>
    {loading && <p role="status" className="mt-5 text-sm text-slate-600">Đang tải tài khoản…</p>}
    {error && <div role="alert" className="mt-4 text-sm text-rose-700">{error} <button onClick={() => setRevision((value) => value + 1)} className="min-h-11 underline">Thử lại</button></div>}
    {!loading && !error && rows.length === 0 && <p className="mt-5 text-sm text-slate-600">Không tìm thấy tài khoản phù hợp.</p>}
    {!error && rows.length > 0 && <div role="region" aria-label="Bảng tài khoản" tabIndex={0} className="mt-5 overflow-x-auto rounded-lg focus-visible:ring-2 focus-visible:ring-blue-700">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>{["ID hệ thống", "ID đăng nhập", "Vai trò", "Trạng thái", "Lần đăng nhập cuối", "Thao tác"].map((label) =>
            <th key={label} scope="col" className="px-3 py-3 font-semibold">{label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => <tr key={row.id}>
            <td className="max-w-38 break-all px-3 py-3 font-mono text-xs text-slate-600">{row.id}</td>
            <th scope="row" className="max-w-54 break-all px-3 py-3 font-medium">{row.loginId}{row.isSelf && <span className="ml-1 text-slate-600">(Bạn)</span>}</th>
            <td className="px-3 py-3">{row.role === "admin" ? "Quản trị viên" : "Người dùng"}</td>
            <td className="px-3 py-3"><span className={row.status === "active" ? "text-emerald-800" : "text-rose-800"}>{row.status === "active" ? "Hoạt động" : "Tạm khóa"}</span>
              {row.mustChangePassword && <span className="mt-1 block text-xs text-slate-600">Chờ đổi mật khẩu</span>}</td>
            <td className="px-3 py-3">{row.lastLoginAt ? <time dateTime={row.lastLoginAt}>{dateFormat.format(new Date(row.lastLoginAt))}</time> : "Chưa đăng nhập"}</td>
            <td className="px-3 py-3">{row.isSelf || row.status === "suspended" ? "—" :
              <button type="button" onClick={() => openReset(row)} className="min-h-11 rounded-xl border border-slate-300 px-3 font-medium text-slate-800 hover:bg-slate-50">Reset mật khẩu</button>}</td>
          </tr>)}
        </tbody>
      </table>
    </div>}
    {(page > 1 || hasNext) && <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      <button type="button" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)} className="min-h-11 rounded-xl border px-3 disabled:opacity-40">Trang trước</button>
      <span>Trang {page}</span>
      <button type="button" disabled={!hasNext || loading} onClick={() => setPage((value) => value + 1)} className="min-h-11 rounded-xl border px-3 disabled:opacity-40">Trang sau</button>
    </div>}

    <dialog ref={dialog} aria-labelledby="reset-title" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-5 shadow-xl backdrop:bg-slate-950/55"
      onCancel={(event) => { if (busy) event.preventDefault(); }}
      onClose={() => { setTarget(null); setResult(null); setCopyNote(""); setResetError(""); }}>
      <h3 id="reset-title" className="text-xl font-semibold">{result ? "Mật khẩu tạm" : "Đặt lại mật khẩu"}</h3>
      <p className="mt-2 break-all text-sm font-medium">{target?.loginId}</p>
      {result ? <>
        <p className="mt-2 text-sm text-slate-600">Sao chép trước khi đóng hộp thoại. Mật khẩu tạm hết hạn lúc {dateFormat.format(new Date(result.expiresAt))}. Người dùng phải đổi mật khẩu khi đăng nhập.</p>
        <label className="mt-3 block text-sm font-medium">Mật khẩu tạm thời
          <input ref={secretInput} readOnly value={result.temporaryPassword} className="input-admin mt-1 min-h-11 font-mono" />
        </label>
        <button type="button" onClick={() => void copy()} className="mt-3 min-h-11 w-full rounded-xl bg-blue-700 px-4 font-semibold text-white">Sao chép mật khẩu</button>
        {copyNote && <p role="status" className="mt-2 text-sm text-slate-700">{copyNote}</p>}
      </> : <>
        <p className="mt-2 text-sm text-slate-600">Mật khẩu hiện tại sẽ hết hiệu lực và các phiên đang mở sẽ bị đăng xuất.</p>
        <button type="button" disabled={busy} onClick={() => void reset()} className="mt-4 min-h-11 w-full rounded-xl bg-blue-700 px-4 font-semibold text-white disabled:opacity-60">{busy ? "Đang đặt lại…" : "Tạo mật khẩu tạm"}</button>
      </>}
      {resetError && <p role="alert" className="mt-2 text-sm text-rose-700">{resetError}</p>}
      <button type="button" disabled={busy} onClick={() => dialog.current?.close()} className="mt-3 min-h-11 w-full rounded-xl border border-slate-300">{result ? "Đóng" : "Hủy"}</button>
    </dialog>
  </section>;
}
