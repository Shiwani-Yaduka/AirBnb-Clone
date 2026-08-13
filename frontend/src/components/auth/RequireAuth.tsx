"use client";

import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { openAuthModal } = useAuthModal();

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-20 sm:px-8" />;
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-8">
        <span className="text-4xl">🔒</span>
        <p className="text-lg font-semibold">Log in to see this page</p>
        <button
          onClick={() => openAuthModal("login")}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Log in
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
