"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listingsApi, usersApi, ApiError } from "@/lib/api";
import type { ListingCard } from "@/lib/types";
import { RequireHost } from "@/components/auth/RequireHost";
import { HostListingRow } from "@/components/host/HostListingRow";
import { BookingsModal } from "@/components/host/BookingsModal";
import { useToast } from "@/lib/toast-context";

function HostDashboardContent() {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsFor, setBookingsFor] = useState<ListingCard | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    usersApi
      .myListings()
      .then(setListings)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: number) {
    try {
      await listingsApi.remove(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      showToast("Listing deleted", "info");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not delete listing", "error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Host dashboard</h1>
        <Link
          href="/host/listings/new"
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Add new listing
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="text-4xl">🏡</span>
          <p className="text-lg font-semibold">You don&apos;t have any listings yet</p>
          <p className="text-sm text-neutral-500">Create your first listing to start hosting.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((listing) => (
            <HostListingRow
              key={listing.id}
              listing={listing}
              onViewBookings={() => setBookingsFor(listing)}
              onDelete={() => handleDelete(listing.id)}
            />
          ))}
        </div>
      )}

      <BookingsModal
        isOpen={bookingsFor !== null}
        onClose={() => setBookingsFor(null)}
        listingId={bookingsFor?.id ?? null}
        listingTitle={bookingsFor?.title ?? ""}
      />
    </div>
  );
}

export default function HostDashboardPage() {
  return (
    <RequireHost>
      <HostDashboardContent />
    </RequireHost>
  );
}
