"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listingsApi, ApiError } from "@/lib/api";
import type { ListingFormInput } from "@/lib/types";
import { RequireHost } from "@/components/auth/RequireHost";
import { ListingForm } from "@/components/host/ListingForm";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

function EditListingContent() {
  const params = useParams<{ id: string }>();
  const listingId = Number(params.id);
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [initialValue, setInitialValue] = useState<ListingFormInput | null>(null);
  const [hostId, setHostId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listingsApi
      .get(listingId)
      .then((listing) => {
        setHostId(listing.host.id);
        setInitialValue({
          title: listing.title,
          description: listing.description,
          property_type: listing.property_type,
          category: listing.category,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          country: listing.country,
          latitude: listing.latitude,
          longitude: listing.longitude,
          price_per_night: listing.price_per_night,
          cleaning_fee: listing.cleaning_fee,
          service_fee_rate: listing.service_fee_rate,
          max_guests: listing.max_guests,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          photo_urls: listing.photos.map((p) => p.url),
          amenity_ids: listing.amenities.map((a) => a.id),
        });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load listing"))
      .finally(() => setIsLoading(false));
  }, [listingId]);

  async function handleSubmit(value: ListingFormInput) {
    try {
      await listingsApi.update(listingId, value);
      showToast("Listing updated!", "success");
      router.push("/host");
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : "Could not update listing");
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">Loading…</div>;
  }

  if (error || !initialValue) {
    return <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">{error ?? "Listing not found"}</div>;
  }

  if (user && hostId !== user.id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:px-8">
        You don&apos;t have permission to edit this listing.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-semibold">Edit listing</h1>
      <ListingForm initialValue={initialValue} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}

export default function EditListingPage() {
  return (
    <RequireHost>
      <EditListingContent />
    </RequireHost>
  );
}
