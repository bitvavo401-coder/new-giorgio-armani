import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

export type UserRole = "master" | "admin" | "agent" | "customer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RoleContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isRefreshing: boolean;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = "currentUser";

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    // Restore from localStorage on initial mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep localStorage in sync with state
  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const user = stored ? JSON.parse(stored) : currentUser;
    if (!user?.email) return false;

    setIsRefreshing(true);
    try {
      const response = await apiRequest("GET", `/api/auth/session?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        setCurrentUser(null);
        return false;
      }
      const data = await response.json();
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        return true;
      }
      setCurrentUser(null);
      return false;
    } catch {
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser, setCurrentUser]);

  // On mount, validate stored session against server
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      refreshSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    apiRequest("POST", "/api/auth/logout").catch(() => { });
  }, [setCurrentUser]);

  return (
    <RoleContext.Provider value={{ currentUser, setCurrentUser, isRefreshing, refreshSession, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
