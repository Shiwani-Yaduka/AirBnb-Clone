"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { SearchBar } from "../search/SearchBar";
import { UserMenu } from "./UserMenu";
import { Modal } from "../ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

const NAV_TABS = [
  { key: "all", label: "All", icon: "🌐" },
  { key: "homes", label: "Homes", icon: "🏠" },
  { key: "experiences", label: "Experiences", icon: "🎈" },
  { key: "services", label: "Services", icon: "🛎️" },
] as const;

export function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof NAV_TABS)[number]["key"]>("all");
  const { user } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const showSearch = pathname === "/";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pt-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-brand">
            <span className="text-2xl">🏡</span>
            <span className="hidden text-xl font-bold sm:inline">airbnb clone</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== "all" && tab.key !== "homes") {
                    showToast(`${tab.label} coming soon!`, "info");
                  }
                }}
                className={`flex flex-col items-center gap-1.5 border-b-2 pb-3 pt-1 text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "border-neutral-900 text-neutral-900"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 pb-4">
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
