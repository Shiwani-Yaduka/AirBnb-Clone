"use client";

import { useState } from "react";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useToast } from "@/lib/toast-context";

interface FavoriteButtonProps {
  listingId: number;
  initialFavorited: boolean;
  size?: "sm" | "lg";
  overPhoto?: boolean;
}

export function FavoriteButton({
  listingId,
  initialFavorited,
  size = "sm",
  overPhoto = true,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      if (next) {
        await usersApi.addFavorite(listingId);
        showToast("Added to wishlist", "success");
      } else {
        await usersApi.removeFavorite(listingId);
        showToast("Removed from wishlist", "info");
      }
    } catch {
      setIsFavorited(!next);
      showToast("Something went wrong", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
      className={`transition hover:scale-110 ${size === "lg" ? "text-3xl" : "text-xl"}`}
    >
      <span
        className={isFavorited ? "text-brand" : overPhoto ? "text-white drop-shadow" : "text-neutral-400"}
        aria-hidden
      >
        {isFavorited ? "♥" : "♡"}
      </span>
    </button>
  );
}
