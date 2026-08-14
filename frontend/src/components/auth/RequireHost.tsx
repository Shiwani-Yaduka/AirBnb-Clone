"use client";

import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useBecomeHostModal } from "@/lib/become-host-modal-context";

// Like RequireAuth, but also blocks non-hosts: guests who never clicked "Become a
// host" can browse and book, but see a call-to-action here instead of the host
// dashboard/listing forms. Clicking it flips them to host (see useBecomeHost).
export function RequireHost({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { requestBecomeHost } = useBecomeHostModal();

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

  if (!user.is_host) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-8">
        <span className="text-4xl">🏡</span>
        <p className="text-lg font-semibold">Become a host to list your place</p>
        <p className="max-w-sm text-sm text-neutral-500">
          Guest accounts can browse and book, but only hosts can create listings.
        </p>
        <button
          onClick={requestBecomeHost}
          className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Become a host
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
