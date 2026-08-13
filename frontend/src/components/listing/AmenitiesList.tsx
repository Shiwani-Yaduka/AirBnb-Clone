"use client";

import { useState } from "react";
import type { Amenity } from "@/lib/types";
import { AMENITY_ICONS } from "@/lib/constants";
import { Modal } from "../ui/Modal";

export function AmenitiesList({ amenities }: { amenities: Amenity[] }) {
  const [showAll, setShowAll] = useState(false);
  if (amenities.length === 0) return null;
  const preview = amenities.slice(0, 8);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">What this place offers</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {preview.map((amenity) => (
          <div key={amenity.id} className="flex items-center gap-3 text-sm">
            <span className="text-xl">{AMENITY_ICONS[amenity.icon_key] ?? "•"}</span>
            {amenity.name}
          </div>
        ))}
      </div>
      {amenities.length > 8 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 rounded-lg border border-neutral-900 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-100"
        >
          Show all {amenities.length} amenities
        </button>
      )}

      <Modal isOpen={showAll} onClose={() => setShowAll(false)} title="What this place offers">
        <div className="flex flex-col gap-4">
          {amenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center gap-3 text-sm">
              <span className="text-xl">{AMENITY_ICONS[amenity.icon_key] ?? "•"}</span>
              {amenity.name}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
