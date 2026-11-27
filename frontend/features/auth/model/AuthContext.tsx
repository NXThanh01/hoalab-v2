"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthUser, UserProfile } from "./auth.types";

export class AuthRequestError extends Error {
  constructor(message: string, readonly fields: Record<string, string> = {}) {
    super(message);
  }
}

async function submitAuth(path: string, body: unknown): Promise<UserProfile> {
  const response = await fetch(path, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.user) throw new AuthRequestError(data.error ?? "Không thể xử lý yêu cầu. Hãy thử lại.", data.fields);
  return data.user;
}

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  logoutError: string;
  login: (loginId: string, password: string, rememberMe: boolean) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ initialUser, children }: { initialUser: AuthUser | null; children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    let checking = false;
    async function refresh() {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const response = await fetch("/api/session", { cache: "no-store" });
        if (!active) return;
        if (response.status === 401) setUser(null);
        else if (response.ok) {
          const data = await response.json() as { user: UserProfile };
          if (active) setUser((previous) => previous && (
            previous.role !== data.user.role || previous.mustChangePassword !== data.user.mustChangePassword
          ) ? data.user : previous);
        }
      } catch {
        // Keep the last verified UI session through short network failures.
      } finally {
        checking = false;
      }
    }
    const interval = window.setInterval(() => void refresh(), 60_000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [user]);

  const login = useCallback(async (loginId: string, password: string, rememberMe: boolean) => {
    setLogoutError("");
    setUser(await submitAuth("/api/auth/login", { loginId, password, rememberMe }));
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string, confirmation: string) => {
    setUser(await submitAuth("/api/auth/change-password", { currentPassword, newPassword, confirmation }));
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("LOGOUT_FAILED");
      setUser(null);
    } catch {
      setLogoutError("Chưa đăng xuất được. Kiểm tra kết nối rồi thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = Boolean(user && !user.mustChangePassword);
  return <AuthContext.Provider value={{ user, isAuthenticated, isAdmin: isAuthenticated && user?.role === "admin", loading, logoutError, login, changePassword, logout }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
