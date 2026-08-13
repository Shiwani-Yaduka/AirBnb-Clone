"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { listingsApi, ApiError } from "@/lib/api";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import type { ListingDetail, Review } from "@/lib/types";
import { PhotoGallery } from "@/components/listing/PhotoGallery";
import { AmenitiesList } from "@/components/listing/AmenitiesList";
import { ReviewsSection } from "@/components/listing/ReviewsSection";
import { FavoriteButton } from "@/components/listing/FavoriteButton";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { useToast } from "@/lib/toast-context";

const ListingMap = dynamic(() => import("@/components/listing/ListingMap"), { ssr: false });

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!listingId) return;
    setIsLoading(true);
    Promise.all([listingsApi.get(listingId), listingsApi.reviews(listingId)])
      .then(([listingData, reviewsData]) => {
        setListing(listingData);
        setReviews(reviewsData);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load listing"))
      .finally(() => setIsLoading(false));
  }, [listingId]);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-8">Loading…</div>;
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-8">
        <p className="text-lg font-semibold">{error ?? "Listing not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{listing.title}</h1>
        <FavoriteButton listingId={listing.id} initialFavorited={listing.is_favorited} overPhoto={false} size="lg" />
      </div>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <StarRating rating={listing.rating} reviewCount={listing.review_count} />
        <span>·</span>
        <span className="underline">
          {listing.city}, {listing.state ? `${listing.state}, ` : ""}
          {listing.country}
        </span>
      </div>

      <PhotoGallery photos={listing.photos} title={listing.title} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line pb-8">
            <div>
              <h2 className="text-xl font-semibold">
                {PROPERTY_TYPE_LABELS[listing.property_type]} hosted by {listing.host.name}
              </h2>
              <p className="text-neutral-600">
                {listing.max_guests} guests · {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""} ·{" "}
                {listing.beds} bed{listing.beds !== 1 ? "s" : ""} · {listing.bathrooms} bath
                {listing.bathrooms !== 1 ? "s" : ""}
              </p>
            </div>
            <Avatar name={listing.host.name} src={listing.host.avatar_url} size={56} />
          </div>

          {listing.host.is_superhost && (
            <div className="-mt-6 flex items-center gap-2 text-sm text-neutral-600">
              <span>🏅</span> {listing.host.name} is a Superhost
            </div>
          )}

          <button
            onClick={() => showToast("Messaging is coming soon!", "info")}
            className="-mt-6 self-start rounded-lg border border-neutral-900 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            Contact host
          </button>

          <p className="whitespace-pre-line text-neutral-700">{listing.description}</p>

          <div className="border-t border-line pt-8">
            <AmenitiesList amenities={listing.amenities} />
          </div>

          <div className="border-t border-line pt-8">
            <h2 className="mb-4 text-xl font-semibold">Where you&apos;ll be</h2>
            <ListingMap latitude={listing.latitude} longitude={listing.longitude} city={listing.city} />
          </div>

          <div className="border-t border-line pt-8">
            <ReviewsSection reviews={reviews} rating={listing.rating} reviewCount={listing.review_count} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingWidget listing={listing} />
        </div>
      </div>
    </div>
  );
}
