"use client";

import { useState } from "react";
import { ArrowRight, Atom, Beaker, BookOpenCheck, Eye, EyeOff, FlaskConical, GraduationCap, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/frontend/features/auth/model/AuthContext";

type DemoRole = "student" | "admin";

const demoAccounts = {
  student: { email: "student@hoalab.local", password: "Student@123", label: "Học sinh" },
  admin: { email: "admin@hoalab.local", password: "Admin@123", label: "Quản trị viên" },
};

export function LoginView() {
  const { login, loading, authError } = useAuth();
  const [role, setRole] = useState<DemoRole>("student");
  const [email, setEmail] = useState(demoAccounts.student.email);
  const [password, setPassword] = useState(demoAccounts.student.password);
  const [showPassword, setShowPassword] = useState(false);

  function chooseRole(nextRole: DemoRole) {
    setRole(nextRole);
    setEmail(demoAccounts[nextRole].email);
    setPassword(demoAccounts[nextRole].password);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try { await login(email, password); } catch { /* rendered by context */ }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f6f7fb] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#0b1120] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-950"><Beaker className="h-6 w-6" /></span><div><p className="text-2xl font-black tracking-tight">HóaLab</p><p className="text-xs text-slate-400">Học Hóa dễ hơn mỗi ngày</p></div></div>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-bold text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> Nền tảng học Hóa thông minh</div>
          <h1 className="text-5xl font-black leading-[1.12] tracking-tight xl:text-6xl">Một tài khoản.<br /><span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Đúng không gian.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">Học sinh tập trung vào lộ trình và bài thi. Quản trị viên vận hành nội dung trong một cổng riêng biệt, an toàn.</p>
          <div className="mt-9 grid grid-cols-3 gap-3">{[{ icon: Atom, value: "AI", label: "Trợ giảng" }, { icon: FlaskConical, value: "24/7", label: "Thí nghiệm" }, { icon: BookOpenCheck, value: "Realtime", label: "Tiến trình" }].map(({ icon: Icon, value, label }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"><Icon className="h-5 w-5 text-indigo-300" /><p className="mt-4 text-lg font-black">{value}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}</div>
        </motion.div>
        <p className="relative text-xs text-slate-500">HóaLab Local Workspace · Dữ liệu lưu trên máy phát triển</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="w-full max-w-[460px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-600 text-white"><Beaker className="h-5 w-5" /></span><div><p className="text-xl font-black">HóaLab</p><p className="text-xs text-slate-500">Local Workspace</p></div></div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Chào mừng trở lại</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Đăng nhập vào HóaLab</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Chọn loại tài khoản để kiểm thử đúng luồng sử dụng.</p>

          <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
            {(["student", "admin"] as DemoRole[]).map((item) => { const Icon = item === "student" ? GraduationCap : ShieldCheck; return <button key={item} type="button" onClick={() => chooseRole(item)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${role === item ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}><Icon className="h-4 w-4" />{demoAccounts[item].label}</button>; })}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" autoComplete="username" /></label>
            <label className="block"><span className="mb-2 block text-xs font-bold text-slate-700">Mật khẩu</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
            {authError && <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-600">{authError}</p>}
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:bg-indigo-600 disabled:opacity-60">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : role === "admin" ? <ShieldCheck className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />} Đăng nhập với vai trò {demoAccounts[role].label}<ArrowRight className="h-4 w-4" /></button>
          </form>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-amber-700">Tài khoản local dùng thử</p><p className="mt-2 text-xs leading-5 text-amber-700/80">Thông tin đã được điền sẵn. Khi triển khai thật, các tài khoản này được thay bằng biến môi trường hoặc Supabase Auth.</p></div>
        </motion.div>
      </section>
    </main>
  );
}
