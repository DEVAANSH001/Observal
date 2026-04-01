"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

type User = { id: string; email: string; name: string; role: string } | null;
const AuthCtx = createContext<{ user: User; loading: boolean; login: (key: string) => Promise<void>; logout: () => void }>({
  user: null, loading: true, login: async () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const key = localStorage.getItem("observal_api_key");
    if (!key) { setLoading(false); return; }
    api.get("/api/v1/auth/whoami")
      .then(u => { if (!cancelled) setUser(u); })
      .catch(() => localStorage.removeItem("observal_api_key"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = async (key: string) => {
    localStorage.setItem("observal_api_key", key);
    try {
      const u = await api.get("/api/v1/auth/whoami");
      setUser(u);
    } catch (e) {
      localStorage.removeItem("observal_api_key");
      throw e;
    }
  };
  const logout = () => { localStorage.removeItem("observal_api_key"); setUser(null); window.location.href = "/login"; };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
