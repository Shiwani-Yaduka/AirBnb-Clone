"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "../ui/Avatar";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useBecomeHostModal } from "@/lib/become-host-modal-context";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { openAuthModal } = useAuthModal();
  const { requestBecomeHost } = useBecomeHostModal();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await logout();
    setOpen(false);
    showToast("Logged out", "info");
    router.push("/");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-line py-1.5 pl-3 pr-1.5 shadow-sm transition hover:shadow-md"
      >
        <span aria-hidden className="text-lg">
          ☰
        </span>
        <Avatar name={user?.name ?? "?"} src={user?.avatar_url} size={30} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-line bg-white py-2 shadow-2xl">
          {user ? (
            <>
              <Link href="/trips" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-neutral-50">
                My trips
              </Link>
              <Link href="/wishlist" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-neutral-50">
                Wishlist
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  requestBecomeHost();
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
              >
                {user.is_host ? "Host dashboard" : "Become a host"}
              </button>
              <div className="my-1 border-t border-line" />
              <button onClick={handleLogout} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50">
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  openAuthModal("signup");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-neutral-50"
              >
                Sign up
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  openAuthModal("login");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
              >
                Log in
              </button>
              <div className="my-1 border-t border-line" />
              <button
                onClick={() => {
                  setOpen(false);
                  requestBecomeHost();
                }}
                className="block w-full px-4 py-2.5 text-left text-sm hover:bg-neutral-50"
              >
                Become a host
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
