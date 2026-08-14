"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useClerk } from "@clerk/nextjs";
import { authApi } from "./api";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Bridges Clerk's session state to our own backend: once Clerk reports a signed-in
// user, /auth/me syncs (and returns) the corresponding local User row, which carries
// app-specific fields Clerk doesn't know about (is_superhost, bio, etc.).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { signOut } = useClerk();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [isLoaded, isSignedIn]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, [signOut]);

  return <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
