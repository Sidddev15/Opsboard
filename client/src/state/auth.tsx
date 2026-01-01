import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiFetch } from '../lib/http';
import type { MeResponse, User } from '../types/api';

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

const LS_TOKEN = 'opsboard_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(LS_TOKEN)
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function boot() {
      try {
        if (!token) return;
        const me = await apiFetch<MeResponse>('/auth/me', { token });
        if (alive) setUser(me.user);
      } catch {
        localStorage.removeItem(LS_TOKEN);
        if (alive) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    }
    boot();
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!token) setIsLoading(false);
  }, [token]);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      isLoading,
      setAuth: (t, u) => {
        localStorage.setItem(LS_TOKEN, t);
        setToken(t);
        setUser(u);
      },
      logout: () => {
        localStorage.removeItem(LS_TOKEN);
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, isLoading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
