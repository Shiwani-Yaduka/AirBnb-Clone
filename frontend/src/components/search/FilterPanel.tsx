"use client";

import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { amenitiesApi } from "@/lib/api";
import { PROPERTY_TYPE_LABELS, AMENITY_ICONS } from "@/lib/constants";
import type { Amenity, PropertyType } from "@/lib/types";

export interface Filters {
  minPrice: string;
  maxPrice: string;
  propertyType: PropertyType | null;
  amenityIds: number[];
}

export const EMPTY_FILTERS: Filters = {
  minPrice: "",
  maxPrice: "",
  propertyType: null,
  amenityIds: [],
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  /** Listing type currently being browsed; the "Property type" section only applies to "home". */
  listingType?: string;
}

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[];

export function FilterPanel({ isOpen, onClose, filters, onApply, listingType }: FilterPanelProps) {
  const [draft, setDraft] = useState<Filters>(filters);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  useEffect(() => {
    amenitiesApi.list().then(setAmenities).catch(() => {});
  }, []);

  function toggleAmenity(id: number) {
    setDraft((d) => ({
      ...d,
      amenityIds: d.amenityIds.includes(id) ? d.amenityIds.filter((a) => a !== id) : [...d.amenityIds, id],
    }));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" maxWidth="max-w-lg">
      <div className="flex flex-col gap-8">
        <section>
          <h3 className="mb-3 font-semibold">Price range per night</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={draft.minPrice}
              onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
            <span className="text-neutral-400">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={draft.maxPrice}
              onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            />
          </div>
        </section>

        {(!listingType || listingType === "home") && (
          <section>
            <h3 className="mb-3 font-semibold">Property type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setDraft((d) => ({ ...d, propertyType: d.propertyType === type ? null : type }))
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    draft.propertyType === type
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-line hover:border-neutral-900"
                  }`}
                >
                  {PROPERTY_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 font-semibold">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {amenities.map((amenity) => (
              <label key={amenity.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.amenityIds.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="h-4 w-4 accent-neutral-900"
                />
                <span>{AMENITY_ICONS[amenity.icon_key] ?? "•"}</span>
                {amenity.name}
              </label>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <button
            onClick={() => setDraft(EMPTY_FILTERS)}
            className="text-sm font-semibold underline"
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            Show results
          </button>
        </div>
      </div>
    </Modal>
  );
}
