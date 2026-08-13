"use client";

import { useCallback, useEffect, useState } from "react";
import { bookingsApi } from "@/lib/api";
import type { BookingWithListing } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { TripCard } from "@/components/booking/TripCard";

function TripsContent() {
  const [trips, setTrips] = useState<BookingWithListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(() => {
    setIsLoading(true);
    bookingsApi
      .myTrips()
      .then(setTrips)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-semibold">My trips</h1>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-center">
          <span className="text-4xl">🧳</span>
          <p className="text-lg font-semibold">No trips booked yet</p>
          <p className="text-sm text-neutral-500">Time to plan your next getaway.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {trips.map((trip) => (
            <TripCard key={trip.id} booking={trip} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  return (
    <RequireAuth>
      <TripsContent />
    </RequireAuth>
  );
}
