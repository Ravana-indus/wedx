"use client";

import * as React from "react";
import type { UserRole, UserSession } from "@/lib/models/auth";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: UserSession | null;
  login: (role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "wedx-auth-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("checking");
  const [user, setUser] = React.useState<UserSession | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw) as UserSession;
        setUser(session);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const login = React.useCallback((role: UserRole = "owner") => {
    const session: UserSession = {
      id: "demo-user",
      role,
    };
    setUser(session);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
    setStatus("authenticated");
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setStatus("unauthenticated");
  }, []);

  const value = React.useMemo(
    () => ({
      status,
      user,
      login,
      logout,
    }),
    [status, user, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

