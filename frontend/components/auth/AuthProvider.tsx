"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  apiRequest,
  ApiError,
  parseAuthResult,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
  unwrapUser,
} from "@/lib/api";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/session";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<AuthUser | null>;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getSessionToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const payload = await apiRequest<AuthUser | { user: AuthUser }>("/auth/me", {
        cache: "no-store",
      });
      const nextUser = unwrapUser(payload);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearSessionToken();
        setUser(null);
        return null;
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void refresh());
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const payload = await apiRequest<AuthUser & { session_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
    const { user: nextUser, sessionToken } = parseAuthResult(payload);
    if (!sessionToken) throw new Error("Oturum oluşturulamadı.");
    setSessionToken(sessionToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const payload = await apiRequest<AuthUser & { session_token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: input.name,
        email: input.email,
        password: input.password,
      }),
    });
    const { user: nextUser, sessionToken } = parseAuthResult(payload);
    if (!sessionToken) throw new Error("Oturum oluşturulamadı.");
    setSessionToken(sessionToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getSessionToken()) {
        await apiRequest<void>("/auth/logout", { method: "POST" });
      }
    } finally {
      clearSessionToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout }),
    [user, loading, refresh, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
