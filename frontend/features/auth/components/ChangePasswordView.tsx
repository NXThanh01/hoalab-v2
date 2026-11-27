"use client";

import { useRef, useState, type FormEvent } from "react";
import { changePasswordInput } from "@/shared/auth-input";
import { AuthRequestError, useAuth } from "../model/AuthContext";
import { AuthField } from "./AuthField";

const empty = { currentPassword: "", newPassword: "", confirmation: "" };

export function ChangePasswordView({ forced, onClose }: { forced: boolean; onClose: () => void }) {
  const { changePassword, logout, loading, logoutError } = useAuth();
  const [values, setValues] = useState(empty);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  function update(field: keyof typeof empty, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setFields((prev) => ({ ...prev, [field]: "" }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    setNotice("");
    setFields({});
    const parsed = changePasswordInput.safeParse(values);
    if (!parsed.success) {
      setFields(Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])));
      return;
    }
    busy.current = true;
    setPending(true);
    try {
      await changePassword(values.currentPassword, values.newPassword, values.confirmation);
      onClose();
    } catch (error) {
      if (error instanceof AuthRequestError && Object.keys(error.fields).length) setFields(error.fields);
      else setNotice(error instanceof AuthRequestError ? error.message : "Không kết nối được. Hãy thử lại.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return <main className="grid min-h-svh place-items-center bg-[#f5f6f8] px-4 py-8 sm:px-6">
    <section className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Đổi mật khẩu</h1>
      <p className="mt-2 text-sm text-slate-600">{forced ? "Bạn đang dùng mật khẩu tạm. Đặt mật khẩu mới để tiếp tục." : "Mật khẩu mới sẽ đăng xuất các phiên trên thiết bị khác."}</p>
      <form onSubmit={submit} noValidate aria-busy={pending} className="mt-5 space-y-4">
        <AuthField label={forced ? "Mật khẩu tạm" : "Mật khẩu hiện tại"} value={values.currentPassword} error={fields.currentPassword} onChange={(value) => update("currentPassword", value)} autoComplete="current-password" password />
        <AuthField label="Mật khẩu mới (ít nhất 15 ký tự)" value={values.newPassword} error={fields.newPassword} onChange={(value) => update("newPassword", value)} autoComplete="new-password" password />
        <AuthField label="Nhập lại mật khẩu mới" value={values.confirmation} error={fields.confirmation} onChange={(value) => update("confirmation", value)} autoComplete="new-password" password />
        {(notice || logoutError) && <p role="alert" className="text-sm text-rose-700">{notice || logoutError}</p>}
        <button type="submit" disabled={pending || loading} className="min-h-12 w-full rounded-xl bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{pending ? "Đang lưu…" : "Lưu mật khẩu mới"}</button>
        <button type="button" disabled={pending || loading} onClick={forced ? () => void logout() : onClose} className="min-h-11 w-full rounded-xl border border-slate-300 text-sm font-medium text-slate-800">{forced ? "Đăng xuất" : "Quay lại"}</button>
      </form>
    </section>
  </main>;
}
