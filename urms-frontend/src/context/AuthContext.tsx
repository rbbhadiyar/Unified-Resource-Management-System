import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getMe } from "../api/auth";

export interface User {
  name: string;
  role: "admin" | "user";
  email?: string;
  userId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUserFromToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER = "user";
const STORAGE_TOKEN = "token";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN));

  useEffect(() => {
    const storedUser = readStoredUser();
    const storedToken = localStorage.getItem(STORAGE_TOKEN);
    if (storedUser) setUser(storedUser);
    if (storedToken) setToken(storedToken);
  }, []);

  const login = (userData: User, accessToken: string) => {
    localStorage.setItem(STORAGE_USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_TOKEN, accessToken);
    setUser(userData);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
    setUser(null);
    setToken(null);
  };

  const setUserFromToken = async () => {
    const t = localStorage.getItem(STORAGE_TOKEN);
    if (!t) return;
    try {
      const { data } = await getMe();
      const u: User = {
        name: data.name,
        email: data.email,
        role: data.role === "admin" ? "admin" : "user",
        userId: data.user_id,
      };
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
      setUser(u);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUserFromToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
