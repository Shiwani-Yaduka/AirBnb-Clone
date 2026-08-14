"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import { differenceInCalendarDays, format } from "date-fns";
import { bookingsApi, listingsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/lib/auth-modal-context";
import { useToast } from "@/lib/toast-context";
import type { BookedRange, ListingDetail } from "@/lib/types";
import { Modal } from "../ui/Modal";
import { CheckoutModal } from "./CheckoutModal";

export function BookingWidget({ listing }: { listing: ListingDetail }) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { showToast } = useToast();
  const router = useRouter();

  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    checkIn: string;
    checkOut: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    listingsApi
      .availability(listing.id)
      .then((res) => setBookedRanges(res.booked_ranges))
      .catch(() => {});
  }, [listing.id]);

  const disabledRanges: Matcher[] = useMemo(
    () => [
      { before: new Date() },
      ...bookedRanges.map((r) => ({
        from: new Date(r.check_in + "T00:00:00"),
        to: new Date(new Date(r.check_out + "T00:00:00").getTime() - 86400000),
      })),
    ],
    [bookedRanges]
  );

  const priceUnit = listing.listing_type === "home" ? "night" : "guest";
  const isOwnListing = user?.id === listing.host.id;
  const nights = range?.from && range?.to ? differenceInCalendarDays(range.to, range.from) : 0;
  const subtotal = nights * listing.price_per_night;
  const serviceFee = subtotal * listing.service_fee_rate;
  const total = subtotal + (nights > 0 ? listing.cleaning_fee : 0) + serviceFee;

  function handleReserveClick() {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!range?.from || !range?.to) {
      showToast("Please select your check-in and check-out dates", "error");
      return;
    }
    setShowCheckout(true);
  }

  async function handleConfirmAndPay() {
    if (!range?.from || !range?.to) return;
    setIsBooking(true);
    try {
      const checkIn = format(range.from, "yyyy-MM-dd");
      const checkOut = format(range.to, "yyyy-MM-dd");
      await bookingsApi.create(listing.id, checkIn, checkOut, guests);
      setShowCheckout(false);
      setConfirmedBooking({ checkIn, checkOut, total: Math.round(total * 100) / 100 });
      const res = await listingsApi.availability(listing.id);
      setBookedRanges(res.booked_ranges);
      setRange(undefined);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not complete booking", "error");
    } finally {
      setIsBooking(false);
    }
  }

  return (
    <div className="sticky top-24 rounded-2xl border border-line p-6 shadow-xl">
      <div className="mb-4 flex items-baseline gap-1">
        <span className="text-xl font-semibold">${listing.price_per_night.toLocaleString()}</span>
        <span className="text-neutral-600">{priceUnit}</span>
      </div>

      <div className="relative rounded-xl border border-neutral-400">
        <button
          type="button"
          onClick={() => setShowCalendar((s) => !s)}
          className="grid w-full grid-cols-2 divide-x divide-neutral-400 text-left"
        >
          <span className="px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase">Check-in</span>
            <span className="text-sm">{range?.from ? format(range.from, "MM/dd/yyyy") : "Add date"}</span>
          </span>
          <span className="px-3 py-2">
            <span className="block text-[10px] font-semibold uppercase">Checkout</span>
            <span className="text-sm">{range?.to ? format(range.to, "MM/dd/yyyy") : "Add date"}</span>
          </span>
        </button>
        <div className="flex items-center justify-between border-t border-neutral-400 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase">Guests</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="h-6 w-6 rounded-full border border-neutral-400 text-sm disabled:opacity-30"
              disabled={guests <= 1}
            >
              −
            </button>
            <span className="text-sm">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(listing.max_guests, g + 1))}
              className="h-6 w-6 rounded-full border border-neutral-400 text-sm disabled:opacity-30"
              disabled={guests >= listing.max_guests}
            >
              +
            </button>
          </div>
        </div>

        {showCalendar && (
          <div className="absolute left-0 top-full z-30 mt-2 rounded-2xl border border-line bg-white p-3 shadow-2xl">
            <DayPicker
              mode="range"
              numberOfMonths={1}
              selected={range}
              onSelect={setRange}
              disabled={disabledRanges}
              classNames={{ selected: "bg-brand text-white", today: "font-bold text-brand" }}
            />
            <div className="flex justify-end px-2 pb-1">
              <button type="button" className="text-sm font-semibold underline" onClick={() => setShowCalendar(false)}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {isOwnListing ? (
        <p className="mt-4 rounded-lg bg-neutral-100 p-3 text-center text-sm text-neutral-600">
          This is your own listing
        </p>
      ) : (
        <button
          onClick={handleReserveClick}
          disabled={isBooking}
          className="mt-4 w-full rounded-xl bg-brand py-3.5 text-center font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          Reserve
        </button>
      )}

      {!isOwnListing && <p className="mt-3 text-center text-sm text-neutral-500">You won&apos;t be charged yet</p>}

      {nights > 0 && (
        <div className="mt-5 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="underline">
              ${listing.price_per_night.toLocaleString()} x {nights} {priceUnit}
              {nights > 1 ? "s" : ""}
            </span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>${listing.cleaning_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-3 font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {range?.from && range?.to && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          checkIn={range.from}
          checkOut={range.to}
          nights={nights}
          guests={guests}
          nightlyRate={listing.price_per_night}
          subtotal={subtotal}
          cleaningFee={listing.cleaning_fee}
          serviceFee={serviceFee}
          total={total}
          isSubmitting={isBooking}
          onConfirm={handleConfirmAndPay}
        />
      )}

      <Modal isOpen={confirmedBooking !== null} onClose={() => setConfirmedBooking(null)} title="Booking confirmed">
        {confirmedBooking && (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">🎉</span>
            <p className="font-semibold">You&apos;re all set!</p>
            <p className="text-sm text-neutral-600">
              {format(new Date(confirmedBooking.checkIn), "MMM d, yyyy")} –{" "}
              {format(new Date(confirmedBooking.checkOut), "MMM d, yyyy")}
            </p>
            <p className="text-sm text-neutral-600">Total paid: ${confirmedBooking.total.toFixed(2)}</p>
            <button
              onClick={() => router.push("/trips")}
              className="mt-2 w-full rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              View my trips
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
