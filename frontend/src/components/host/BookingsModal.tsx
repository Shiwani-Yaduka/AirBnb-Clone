"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Modal } from "../ui/Modal";
import { Avatar } from "../ui/Avatar";
import { listingsApi } from "@/lib/api";
import type { BookingWithGuest } from "@/lib/types";

export function BookingsModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  listingId: number | null;
  listingTitle: string;
}) {
  const [bookings, setBookings] = useState<BookingWithGuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || listingId === null) return;
    setIsLoading(true);
    listingsApi
      .bookingsForListing(listingId)
      .then(setBookings)
      .finally(() => setIsLoading(false));
  }, [isOpen, listingId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Bookings for ${listingTitle}`} maxWidth="max-w-xl">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-neutral-500">No bookings yet for this listing.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex items-center gap-3 rounded-lg border border-line p-3">
              <Avatar name={booking.guest_name} src={booking.guest_avatar_url} size={36} />
              <div className="flex-1">
                <p className="text-sm font-medium">{booking.guest_name}</p>
                <p className="text-xs text-neutral-500">
                  {format(new Date(booking.check_in), "MMM d")} – {format(new Date(booking.check_out), "MMM d, yyyy")} ·{" "}
                  {booking.num_guests} guest{booking.num_guests > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${booking.total_price.toLocaleString()}</p>
                <p className={`text-xs ${booking.status === "cancelled" ? "text-neutral-400" : "text-green-600"}`}>
                  {booking.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
