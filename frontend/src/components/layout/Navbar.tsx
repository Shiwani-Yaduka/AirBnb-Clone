"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "../search/SearchBar";
import { UserMenu } from "./UserMenu";
import { Modal } from "../ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { GlobeIcon, SearchTabIcon } from "./NavIcons";

const NAV_TABS = [
  { key: "all", label: "All", icon: null },
  { key: "homes", label: "Homes", icon: "/assets/images/home.png" },
  { key: "experiences", label: "Experiences", icon: "/assets/images/balloon.png" },
  { key: "services", label: "Services", icon: "/assets/images/ring.jpg" },
] as const;

// Maps a nav tab key to the "type" search param it navigates to (null = no param, i.e. plain "/").
const TAB_TYPE_PARAM: Record<(typeof NAV_TABS)[number]["key"], string | null> = {
  all: null,
  homes: "home",
  experiences: "experience",
  services: "service",
};

// Reads the "type" search param, so it's isolated in its own Suspense boundary - Navbar is
// rendered on every page (including statically-prerendered ones) via the root layout, and
// useSearchParams() there requires Suspense or the build fails on those static pages.
function NavTabButtons({ variant }: { variant: "desktop" | "mobile" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const activeTab: (typeof NAV_TABS)[number]["key"] =
    typeParam === "experience"
      ? "experiences"
      : typeParam === "service"
        ? "services"
        : typeParam === "home"
          ? "homes"
          : "all";

  function handleTabClick(key: (typeof NAV_TABS)[number]["key"]) {
    const type = TAB_TYPE_PARAM[key];
    router.push(type ? `/?type=${type}` : "/");
  }

  if (variant === "mobile") {
    return (
      <>
        {NAV_TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleTabClick(key)}
            className={`flex shrink-0 flex-col items-center gap-1 text-xs font-medium ${
              activeTab === key ? "text-neutral-900" : "text-neutral-500"
            }`}
          >
            {icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={icon} alt="" className="h-6 w-6 object-contain" />
            ) : (
              <GlobeIcon className="h-5 w-5" />
            )}
            {label}
          </button>
        ))}
      </>
    );
  }

  return (
    <>
      {NAV_TABS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => handleTabClick(key)}
          className={`flex flex-col items-center gap-1.5 border-b-2 pb-3 pt-1 text-sm font-medium transition ${
            activeTab === key
              ? "border-neutral-900 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          }`}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" className="h-7 w-7 object-contain" />
          ) : (
            <GlobeIcon className="h-6 w-6" />
          )}
          {label}
        </button>
      ))}
    </>
  );
}

export function Navbar() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const showSearch = pathname === "/";

  useEffect(() => {
    if (!showSearch) {
      setScrolled(false);
      return;
    }
    function onScroll() {
      setScrolled(window.scrollY > 4);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showSearch]);

  const shrink = showSearch && scrolled;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 pt-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/images/Airbnb-logo.png" alt="Airbnb" className="h-8 w-auto" />
          </Link>

          <nav
            className={`hidden flex-1 items-center justify-center gap-8 overflow-hidden transition-all duration-300 md:flex ${
              shrink ? "max-h-0 -translate-y-2 opacity-0" : "max-h-20 translate-y-0 opacity-100"
            }`}
          >
            <Suspense fallback={null}>
              <NavTabButtons variant="desktop" />
            </Suspense>
          </nav>

          {shrink && (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="hidden flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white py-2.5 pl-4 pr-2 text-sm font-medium shadow-sm transition hover:shadow-md md:flex"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/images/home.png" alt="" className="h-5 w-5 object-contain" />
              <span className="text-neutral-900">{"Anywhere"}</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-900">{"Anytime"}</span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Add guests</span>
              <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm text-white">
                🔍
              </span>
            </button>
          )}

          <div className="flex shrink-0 items-center gap-3 pb-4">
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
          <div
            className={`mx-auto hidden max-w-7xl justify-center px-4 transition-all duration-300 md:flex ${
              shrink
                ? "max-h-0 -translate-y-2 overflow-hidden pb-0 opacity-0"
                : "max-h-24 translate-y-0 overflow-visible pb-5 opacity-100"
            }`}
          >
            <SearchBar />
          </div>
        )}

        {showSearch && (
          <div className="px-4 pb-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(true)}
              className="flex w-full items-center gap-3 rounded-full border border-line bg-white py-3 pl-4 pr-4 text-left shadow-sm"
            >
              <SearchTabIcon className="h-4 w-4 shrink-0 text-neutral-900" />
              <span className="text-sm font-semibold text-neutral-900">Start your search</span>
            </button>
          </div>
        )}

        <nav className="scrollbar-none flex gap-6 overflow-x-auto border-t border-line px-4 py-3 md:hidden">
          <Suspense fallback={null}>
            <NavTabButtons variant="mobile" />
          </Suspense>
        </nav>
      </header>

      {showSearch && (
        <Modal isOpen={mobileSearchOpen} onClose={() => setMobileSearchOpen(false)} title="Search" maxWidth="max-w-md">
          <SearchBar onSearch={() => setMobileSearchOpen(false)} compact />
        </Modal>
      )}
    </>
  );
}
