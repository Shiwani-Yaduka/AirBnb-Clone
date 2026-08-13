"use client";

import { useEffect, useState } from "react";
import { amenitiesApi } from "@/lib/api";
import { PROPERTY_TYPE_LABELS, CATEGORY_META, AMENITY_ICONS } from "@/lib/constants";
import type { Amenity, Category, ListingFormInput, PropertyType } from "@/lib/types";
import { PhotoUrlPicker } from "./PhotoUrlPicker";

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];
const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

export const EMPTY_LISTING_FORM: ListingFormInput = {
  title: "",
  description: "",
  property_type: "house",
  category: "trending",
  address: "",
  city: "",
  state: "",
  country: "",
  latitude: 0,
  longitude: 0,
  price_per_night: 100,
  cleaning_fee: 30,
  service_fee_rate: 0.12,
  max_guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  photo_urls: [],
  amenity_ids: [],
};

interface ListingFormProps {
  initialValue?: ListingFormInput;
  onSubmit: (value: ListingFormInput) => Promise<void>;
  submitLabel: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800";

export function ListingForm({ initialValue, onSubmit, submitLabel }: ListingFormProps) {
  const [form, setForm] = useState<ListingFormInput>(initialValue ?? EMPTY_LISTING_FORM);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    amenitiesApi.list().then(setAmenities).catch(() => {});
  }, []);

  function update<K extends keyof ListingFormInput>(key: K, value: ListingFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(id: number) {
    update(
      "amenity_ids",
      form.amenity_ids.includes(id) ? form.amenity_ids.filter((a) => a !== id) : [...form.amenity_ids, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.photo_urls.length === 0) {
      setError("Please add at least one photo");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Basics</h2>
        <Field label="Title">
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Property type">
            <select
              value={form.property_type}
              onChange={(e) => update("property_type", e.target.value as PropertyType)}
              className={inputClass}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {PROPERTY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value as Category)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_META[cat].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Location</h2>
        <Field label="Street address">
          <input
            required
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="City">
            <input required value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
          </Field>
          <Field label="State/Region">
            <input
              value={form.state ?? ""}
              onChange={(e) => update("state", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Country">
            <input
              required
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Latitude">
            <input
              required
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => update("latitude", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Longitude">
            <input
              required
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => update("longitude", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Capacity & pricing</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Max guests">
            <input
              required
              type="number"
              min={1}
              value={form.max_guests}
              onChange={(e) => update("max_guests", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Bedrooms">
            <input
              required
              type="number"
              min={0}
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Beds">
            <input
              required
              type="number"
              min={0}
              value={form.beds}
              onChange={(e) => update("beds", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Bathrooms">
            <input
              required
              type="number"
              min={0}
              step={0.5}
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price per night ($)">
            <input
              required
              type="number"
              min={1}
              value={form.price_per_night}
              onChange={(e) => update("price_per_night", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Cleaning fee ($)">
            <input
              required
              type="number"
              min={0}
              value={form.cleaning_fee}
              onChange={(e) => update("cleaning_fee", Number(e.target.value))}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Amenities</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities.map((amenity) => (
            <label key={amenity.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.amenity_ids.includes(amenity.id)}
                onChange={() => toggleAmenity(amenity.id)}
                className="h-4 w-4 accent-neutral-900"
              />
              <span>{AMENITY_ICONS[amenity.icon_key] ?? "•"}</span>
              {amenity.name}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Photos</h2>
        <PhotoUrlPicker value={form.photo_urls} onChange={(urls) => update("photo_urls", urls)} />
      </section>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
