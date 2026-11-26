"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, UserProfile } from "./auth.types";

type AuthState = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ initialUser, children }: { initialUser: AuthUser | null; children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (response.status === 401) {
        setUser(null);
        return;
      }
      if (!response.ok) throw new Error("SESSION_FAILED");
      const data = await response.json() as { user: UserProfile };
      setUser(data.user);
    } catch {
      setUser(initialUser as UserProfile | null);
    } finally {
      setLoading(false);
    }
  }, [initialUser]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refreshSession(), 0);
    return () => window.clearTimeout(initialRefresh);
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json() as { user?: UserProfile; error?: string };
      if (!response.ok || !data.user) throw new Error(data.error ?? "Không thể đăng nhập.");
      setUser(data.user);
      return data.user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể đăng nhập.";
      setAuthError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setAuthError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isAdmin: Boolean(user && "role" in user && user.role === "admin"),
    loading,
    authError,
    login,
    logout,
    refreshSession,
  }), [authError, loading, login, logout, refreshSession, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
