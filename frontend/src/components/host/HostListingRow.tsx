"use client";

import Link from "next/link";
import { useState } from "react";
import type { ListingCard } from "@/lib/types";
import { StarRating } from "../ui/StarRating";

interface HostListingRowProps {
  listing: ListingCard;
  onViewBookings: () => void;
  onDelete: () => Promise<void>;
}

export function HostListingRow({ listing, onViewBookings, onDelete }: HostListingRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {listing.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_photo_url}
            alt={listing.title}
            className="h-20 w-20 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-2xl">
            🏠
          </div>
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/listings/${listing.id}`} className="block truncate font-semibold hover:underline">
            {listing.title}
          </Link>
          <p className="truncate text-sm text-neutral-500">
            {listing.city}, {listing.country}
          </p>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <StarRating rating={listing.rating} reviewCount={listing.review_count} />
            <span className="font-medium">${listing.price_per_night.toLocaleString()}/night</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onViewBookings}
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Bookings
        </button>
        <Link
          href={`/host/listings/${listing.id}/edit`}
          className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Edit
        </Link>
        {confirmingDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {isDeleting ? "Deleting…" : "Confirm"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg px-2 py-2 text-sm text-neutral-500 hover:bg-neutral-50"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
