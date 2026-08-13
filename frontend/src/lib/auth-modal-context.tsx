"use client";

import { createContext, useContext, useState } from "react";
import { AuthModal } from "@/components/layout/AuthModal";

type AuthMode = "login" | "signup";

interface AuthModalContextValue {
  openAuthModal: (mode: AuthMode) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);

  return (
    <AuthModalContext.Provider value={{ openAuthModal: setMode }}>
      {children}
      <AuthModal isOpen={mode !== null} onClose={() => setMode(null)} initialMode={mode ?? "login"} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
