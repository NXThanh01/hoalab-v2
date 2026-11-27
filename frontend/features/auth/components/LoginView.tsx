"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Beaker } from "lucide-react";
import { loginInput } from "@/shared/auth-input";
import { AuthRequestError, useAuth } from "../model/AuthContext";
import { AuthField } from "./AuthField";

export function LoginView() {
  const { login } = useAuth();
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  useEffect(() => { loginRef.current?.focus(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setNotice("");
    setFields({});
    setLoginId(loginId.trim());
    const parsed = loginInput.safeParse({ loginId, password, rememberMe: remember });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFields({ loginId: errors.loginId?.[0] ?? "", password: errors.password?.[0] ?? "" });
      (errors.loginId ? loginRef : passwordRef).current?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      await login(parsed.data.loginId, password, remember);
    } catch (error) {
      if (error instanceof AuthRequestError && Object.keys(error.fields).length) {
        setFields(error.fields);
        (error.fields.loginId ? loginRef : passwordRef).current?.focus();
      } else {
        setNotice(error instanceof AuthRequestError ? error.message : "Không kết nối được. Hãy thử lại.");
        if (error instanceof AuthRequestError) passwordRef.current?.focus();
      }
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <main className="grid min-h-svh place-items-center bg-[#f5f6f8] px-4 py-8 sm:px-6">
    <section className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex items-center gap-2 font-semibold text-blue-800"><Beaker aria-hidden="true" className="size-5" /> HóaLab</div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">Đăng nhập</h1>
      <form onSubmit={submit} noValidate aria-busy={pending} className="mt-6 space-y-4">
        <AuthField inputRef={loginRef} label="ID đăng nhập" value={loginId} autoComplete="username"
          error={fields.loginId} onChange={(value) => { setLoginId(value); setFields((prev) => ({ ...prev, loginId: "" })); setNotice(""); }} />
        <AuthField inputRef={passwordRef} label="Mật khẩu" value={password} autoComplete="current-password" password
          error={fields.password} describedBy={notice ? "login-feedback" : undefined}
          onChange={(value) => { setPassword(value); setFields((prev) => ({ ...prev, password: "" })); setNotice(""); }} />
        {notice && <p id="login-feedback" role="alert" className="text-sm text-rose-700">{notice}</p>}
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700">
          <input type="checkbox" className="size-4 accent-blue-700" checked={remember} onChange={(event) => setRemember(event.currentTarget.checked)} />
          Ghi nhớ đăng nhập trên thiết bị này
        </label>
        <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-blue-700 px-4 font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60">
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </section>
  </main>;
}
