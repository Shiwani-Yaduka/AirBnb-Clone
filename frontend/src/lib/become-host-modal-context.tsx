"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import { useAuthModal } from "./auth-modal-context";
import { useToast } from "./toast-context";
import { usersApi, ApiError } from "./api";
import { Modal } from "@/components/ui/Modal";

interface BecomeHostModalContextValue {
  requestBecomeHost: () => void;
}

const BecomeHostModalContext = createContext<BecomeHostModalContextValue | null>(null);

// "Become a host" needs an explicit confirmation, not a silent one-click flip: logged
// out opens signup, already-a-host just navigates to the dashboard, otherwise this
// opens a confirm modal and only calls the API once the user actually confirms.
export function BecomeHostModalProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestBecomeHost = useCallback(() => {
    if (!user) {
      openAuthModal("signup");
      return;
    }
    if (user.is_host) {
      router.push("/host");
      return;
    }
    setIsOpen(true);
  }, [user, openAuthModal, router]);

  async function handleConfirm() {
    setIsSubmitting(true);
    try {
      const updated = await usersApi.becomeHost();
      setUser(updated);
      setIsOpen(false);
      showToast("You're now a host! Let's create your first listing.", "success");
      router.push("/host");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't start hosting", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BecomeHostModalContext.Provider value={{ requestBecomeHost }}>
      {children}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Become a host">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">🏡</span>
          <p className="text-sm text-neutral-600">
            You&apos;ll be able to create and manage your own listings, homes, experiences, or services.
            You can still browse and book as a guest either way.
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {isSubmitting ? "Starting…" : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </BecomeHostModalContext.Provider>
  );
}

export function useBecomeHostModal(): BecomeHostModalContextValue {
  const ctx = useContext(BecomeHostModalContext);
  if (!ctx) throw new Error("useBecomeHostModal must be used within BecomeHostModalProvider");
  return ctx;
}
