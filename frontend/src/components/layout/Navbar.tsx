"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "../search/SearchBar";
import { UserMenu } from "./UserMenu";
import { Modal } from "../ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { CATEGORY_META } from "@/lib/constants";
import type { Category } from "@/lib/types";

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

// Reads/writes the `category` query param so the nav stays in sync with the home page grid.
function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") as Category | null;

  function select(category: Category | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    router.push(`/?${params.toString()}`);
  }

  return (
    <nav className="scrollbar-none hidden min-w-0 flex-1 items-center gap-6 overflow-x-auto md:flex">
      <button
        onClick={() => select(null)}
        className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-3 pt-1 text-xs font-medium transition ${
          active === null ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <span className="text-xl leading-none">🌐</span>
        All
      </button>
      {CATEGORIES.map((category) => {
        const meta = CATEGORY_META[category];
        const isActive = active === category;
        return (
          <button
            key={category}
            onClick={() => select(isActive ? null : category)}
            className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-3 pt-1 text-xs font-medium transition ${
              isActive ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <span className="text-xl leading-none">{meta.emoji}</span>
            {meta.label}
          </button>
        );
      })}
    </nav>
  );
}

export function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const showSearch = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 pt-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-brand">
            <span className="text-2xl">🏡</span>
            <span className="hidden text-xl font-bold sm:inline">airbnb clone</span>
          </Link>

          {showSearch ? (
            <Suspense fallback={<div className="hidden flex-1 md:block" />}>
              <CategoryNav />
            </Suspense>
          ) : (
            <div className="flex-1" />
          )}

          <div className="flex shrink-0 items-center gap-3 pb-4">
            {showSearch && (
              <button
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Search"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-lg shadow-sm md:hidden"
              >
                🔍
              </button>
            )}
            <Link
              href="/host"
              className="hidden rounded-full px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 sm:block"
            >
              {user ? "Host dashboard" : "Become a host"}
            </Link>
            <button
              onClick={() => showToast("Language & currency settings coming soon!", "info")}
              aria-label="Language and region"
              className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 sm:flex"
            >
              🌐
            </button>
            <UserMenu />
          </div>
        </div>

        {showSearch && (
          <div className="mx-auto hidden max-w-7xl justify-center px-4 pb-5 md:flex">
            <SearchBar />
          </div>
        )}
      </header>

      {showSearch && (
        <Modal isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} title="Search" maxWidth="max-w-md">
          <SearchBar onSearch={() => setMobileSearchOpen(false)} compact />
        </Modal>
      )}
    </>
  );
}
