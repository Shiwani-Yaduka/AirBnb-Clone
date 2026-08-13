"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingGridSkeleton } from "@/components/listing/ListingGridSkeleton";

function WishlistContent() {
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    usersApi
      .myFavorites()
      .then(setListings)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-semibold">Wishlist</h1>

      {isLoading ? (
        <ListingGridSkeleton count={8} />
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="text-4xl">🤍</span>
          <p className="text-lg font-semibold">No saved listings yet</p>
          <p className="text-sm text-neutral-500">Tap the heart on any listing to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  );
}
