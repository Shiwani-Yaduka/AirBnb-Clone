"use client";

import { useRouter } from "next/navigation";
import { listingsApi, ApiError } from "@/lib/api";
import type { ListingFormInput } from "@/lib/types";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ListingForm } from "@/components/host/ListingForm";
import { useToast } from "@/lib/toast-context";

function NewListingContent() {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(value: ListingFormInput) {
    try {
      const listing = await listingsApi.create(value);
      showToast("Listing created!", "success");
      router.push(`/listings/${listing.id}`);
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : "Could not create listing");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="mb-6 text-2xl font-semibold">Create a new listing</h1>
      <ListingForm onSubmit={handleSubmit} submitLabel="Publish listing" />
    </div>
  );
}

export default function NewListingPage() {
  return (
    <RequireAuth>
      <NewListingContent />
    </RequireAuth>
  );
}
