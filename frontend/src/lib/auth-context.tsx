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

const LAST_ACTIVE_KEY = "abc_last_active_at";
// Clerk's own session can otherwise stay silently valid for a long time (its default
// inactivity/lifetime limits are generous). This enforces a shorter, app-level idle
// timeout so reopening the browser after a long gap requires signing in again.
const SESSION_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

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
      localStorage.removeItem(LAST_ACTIVE_KEY);
      return;
    }

    const lastActive = Number(localStorage.getItem(LAST_ACTIVE_KEY) ?? 0);
    if (lastActive && Date.now() - lastActive > SESSION_IDLE_TIMEOUT_MS) {
      localStorage.removeItem(LAST_ACTIVE_KEY);
      setUser(null);
      setIsLoading(false);
      signOut();
      return;
    }

    setIsLoading(true);
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, [isLoaded, isSignedIn, signOut]);

  // Keep the "last active" timestamp fresh while signed in, so the idle clock only
  // starts accumulating once the tab/browser is actually closed or left untouched.
  useEffect(() => {
    if (!isSignedIn) return;
    const touch = () => localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    touch();
    const interval = setInterval(touch, 60_000);
    document.addEventListener("visibilitychange", touch);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", touch);
    };
  }, [isSignedIn]);

  const logout = useCallback(async () => {
    localStorage.removeItem(LAST_ACTIVE_KEY);
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
