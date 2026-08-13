"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import type { BookingWithListing } from "@/lib/types";
import { bookingsApi, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import { ReviewModal } from "./ReviewModal";

export function TripCard({ booking, onChanged }: { booking: BookingWithListing; onChanged: () => void }) {
  const [showReview, setShowReview] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { showToast } = useToast();

  const isUpcoming = booking.status === "confirmed" && new Date(booking.check_out) >= new Date();

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await bookingsApi.cancel(booking.id);
      showToast("Booking cancelled", "info");
      onChanged();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not cancel booking", "error");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-line p-4">
      <Link href={`/listings/${booking.listing_id}`} className="shrink-0">
        {booking.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={booking.cover_photo_url}
            alt={booking.listing_title}
            className="h-28 w-28 rounded-xl object-cover sm:h-36 sm:w-36"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-neutral-100 text-3xl sm:h-36 sm:w-36">
            🏠
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link href={`/listings/${booking.listing_id}`} className="font-semibold hover:underline">
              {booking.listing_title}
            </Link>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                booking.status === "cancelled"
                  ? "bg-neutral-100 text-neutral-500"
                  : isUpcoming
                    ? "bg-green-50 text-green-700"
                    : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {booking.status === "cancelled" ? "Cancelled" : isUpcoming ? "Upcoming" : "Completed"}
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            {booking.listing_city}, {booking.listing_country}
          </p>
          <p className="mt-1 text-sm">
            {format(new Date(booking.check_in), "MMM d, yyyy")} – {format(new Date(booking.check_out), "MMM d, yyyy")}
          </p>
          <p className="text-sm text-neutral-500">
            {booking.num_guests} guest{booking.num_guests > 1 ? "s" : ""} · ${booking.total_price.toLocaleString()}
          </p>
        </div>

        <div className="mt-2 flex gap-3">
          {booking.status === "confirmed" && isUpcoming && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
            >
              {isCancelling ? "Cancelling…" : "Cancel booking"}
            </button>
          )}
          {booking.can_review && (
            <button
              onClick={() => setShowReview(true)}
              className="rounded-lg border border-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
            >
              Leave a review
            </button>
          )}
          {booking.has_reviewed && <span className="self-center text-sm text-neutral-500">✓ Reviewed</span>}
        </div>
      </div>

      <ReviewModal
        isOpen={showReview}
        onClose={() => setShowReview(false)}
        bookingId={booking.id}
        listingTitle={booking.listing_title}
        onSubmitted={onChanged}
      />
    </div>
  );
}
