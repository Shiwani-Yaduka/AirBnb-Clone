import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";

export function ListingCard({ listing }: { listing: ListingCardType }) {
  const isGuestFavourite = listing.review_count > 0 && listing.rating >= 4.8;

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        {listing.cover_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_photo_url}
            alt={listing.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🏠</div>
        )}
        {isGuestFavourite && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold shadow">
            Guest favourite
          </span>
        )}
        <div className="absolute right-3 top-3">
          <FavoriteButton listingId={listing.id} initialFavorited={listing.is_favorited} />
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-neutral-900">{listing.title}</p>
        <p className="truncate text-sm text-neutral-500">
          {listing.city}, {listing.country}
        </p>
        <p className="mt-0.5 text-sm text-neutral-900">
          <span className="font-semibold">${listing.price_per_night.toLocaleString()}</span>{" "}
          {listing.listing_type === "home" ? "night" : "guest"}
          {listing.review_count > 0 && (
            <>
              {" "}
              · <span aria-hidden>★</span> {listing.rating.toFixed(1)}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
