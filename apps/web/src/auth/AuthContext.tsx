import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type AuthUser,
} from "../api/client";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setUser(await apiLogin(email, password));
      queryClient.removeQueries({ queryKey: ["my-orders"] });
    },
    [queryClient],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setUser(await apiRegister(name, email, password));
      queryClient.removeQueries({ queryKey: ["my-orders"] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    // Si falla (red/servidor), la sesión puede seguir válida: se mantiene
    // el usuario y la UI muestra el error con opción de reintentar.
    await apiLogout();
    setUser(null);
    queryClient.removeQueries({ queryKey: ["my-orders"] });
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth needs AuthProvider");
  return ctx;
}
