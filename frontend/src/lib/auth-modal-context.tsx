"use client";

import { createContext, useCallback, useContext } from "react";
import { useClerk } from "@clerk/nextjs";

type AuthMode = "login" | "signup";

interface AuthModalContextValue {
  openAuthModal: (mode: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

// Thin wrapper around Clerk's own modal overlay (openSignIn/openSignUp), keeping the
// same openAuthModal(mode) contract every other component in the app already calls.
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const clerk = useClerk();

  const openAuthModal = useCallback(
    (mode: AuthMode) => {
      if (mode === "login") clerk.openSignIn({});
      else clerk.openSignUp({});
    },
    [clerk],
  );

  return <AuthModalContext.Provider value={{ openAuthModal }}>{children}</AuthModalContext.Provider>;
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
