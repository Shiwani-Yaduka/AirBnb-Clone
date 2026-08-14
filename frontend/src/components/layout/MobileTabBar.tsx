"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { Avatar } from "../ui/Avatar";
import { HeartTabIcon, PersonTabIcon, SearchTabIcon, SuitcaseTabIcon } from "./NavIcons";

// Fixed bottom nav shown on mobile only, mirroring Airbnb's app-like mobile web bar:
// Explore / Wishlists / (Trips) / Log in-or-Profile. Desktop uses the top navbar instead.
export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
      active ? "text-neutral-900" : "text-neutral-500"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link href="/" className={itemClass(pathname === "/")}>
        <SearchTabIcon className="h-6 w-6" />
        Explore
      </Link>
      <Link href="/wishlist" className={itemClass(pathname === "/wishlist")}>
        <HeartTabIcon className="h-6 w-6" />
        Wishlists
      </Link>
      {user && (
        <Link href="/trips" className={itemClass(pathname === "/trips")}>
          <SuitcaseTabIcon className="h-6 w-6" />
          Trips
        </Link>
      )}
      {user ? (
        <Link href="/host" className={itemClass(pathname === "/host")}>
          <Avatar name={user.name} src={user.avatar_url} size={24} />
          Profile
        </Link>
      ) : (
        <button type="button" onClick={() => openAuthModal("login")} className={itemClass(false)}>
          <PersonTabIcon className="h-6 w-6" />
          Log in
        </button>
      )}
    </nav>
  );
}
