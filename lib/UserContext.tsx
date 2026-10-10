"use client";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User } from "./types";
import { setupAxiosInterceptors } from "./axiosSetup";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loaded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  // El usuario (y su rol) siempre se pide al servidor: la sesión vive en una
  // cookie httpOnly que el navegador no puede leer ni alterar.
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const data = response.ok ? await response.json() : null;
      setUser(data?.success ? data.data : null);
    } catch {
      setUser(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    setupAxiosInterceptors();
    // Limpia el usuario que versiones anteriores guardaban en localStorage
    try {
      localStorage.removeItem("user");
    } catch {}
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {}
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshUser, loaded }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
