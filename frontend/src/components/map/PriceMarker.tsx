"use client";

import Link from "next/link";
import { MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";
import type { ListingCard } from "@/lib/types";

// Formats a price for the map pin — always ₹, the currency the maps feature was
// asked to show on markers specifically (the rest of the app still shows $).
export function formatMapPrice(price: number): string {
  return `₹${Math.round(price).toLocaleString("en-IN")}`;
}

interface PriceMarkerProps {
  listing: Pick<
    ListingCard,
    "id" | "latitude" | "longitude" | "price_per_night" | "title" | "city" | "country" | "cover_photo_url" | "rating" | "review_count"
  >;
  active?: boolean;
  onHoverChange?: (hovering: boolean) => void;
  withPopup?: boolean;
}

// A single Airbnb-style price pin: a rounded pill that inverts to solid black on
// hover/active, with a mini listing card in a popup on click (mapcn wires a
// marker's attached MarkerPopup to open on click natively).
export function PriceMarker({ listing, active = false, onHoverChange, withPopup = true }: PriceMarkerProps) {
  return (
    <MapMarker
      longitude={listing.longitude}
      latitude={listing.latitude}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <MarkerContent>
        <button
          type="button"
          className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap shadow-md transition-transform hover:scale-105 ${
            active ? "z-10 scale-105 bg-neutral-900 text-white" : "bg-white text-neutral-900"
          }`}
        >
          {formatMapPrice(listing.price_per_night)}
        </button>
      </MarkerContent>

      {withPopup && (
        <MarkerPopup offset={14} className="w-64 rounded-2xl border-0 p-0 shadow-xl">
          <Link href={`/listings/${listing.id}`} className="block overflow-hidden rounded-2xl bg-white">
            <div className="relative aspect-[4/3] w-full bg-neutral-100">
              {listing.cover_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.cover_photo_url} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">🏠</div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 p-3">
              <p className="truncate text-sm font-medium text-neutral-900">{listing.title}</p>
              <p className="truncate text-sm text-neutral-500">
                {listing.city}, {listing.country}
              </p>
              <p className="mt-0.5 text-sm text-neutral-900">
                <span className="font-semibold">{formatMapPrice(listing.price_per_night)}</span>
                {listing.review_count > 0 && (
                  <>
                    {" "}
                    · <span aria-hidden>★</span> {listing.rating.toFixed(1)}
                  </>
                )}
              </p>
            </div>
          </Link>
        </MarkerPopup>
      )}
    </MapMarker>
  );
}
