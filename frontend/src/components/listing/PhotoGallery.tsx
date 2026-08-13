"use client";

import { useState } from "react";
import type { ListingPhoto } from "@/lib/types";
import { Modal } from "../ui/Modal";

export function PhotoGallery({ photos, title }: { photos: ListingPhoto[]; title: string }) {
  const [showAll, setShowAll] = useState(false);
  if (photos.length === 0) return null;

  const [main, ...rest] = photos;
  const sideShots = rest.slice(0, 4);

  return (
    <>
      <div className="relative grid h-70 grid-cols-1 grid-rows-1 gap-2 overflow-hidden rounded-2xl sm:h-105 sm:grid-cols-4 sm:grid-rows-2">
        <button
          onClick={() => setShowAll(true)}
          className="relative col-span-1 row-span-1 overflow-hidden sm:col-span-2 sm:row-span-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={main.url} alt={title} className="h-full w-full object-cover transition hover:scale-105" />
        </button>
        {sideShots.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setShowAll(true)}
            className={`relative hidden overflow-hidden sm:block ${i >= 2 ? "sm:hidden lg:block" : ""}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={title} className="h-full w-full object-cover transition hover:scale-105" />
          </button>
        ))}
        {photos.length > 1 && (
          <button
            onClick={() => setShowAll(true)}
            className="absolute bottom-4 right-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow-md hover:bg-neutral-100"
          >
            Show all {photos.length} photos
          </button>
        )}
      </div>

      <Modal isOpen={showAll} onClose={() => setShowAll(false)} title={title} maxWidth="max-w-4xl">
        <div className="flex flex-col gap-3">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.url} alt={title} className="w-full rounded-xl object-cover" />
          ))}
        </div>
      </Modal>
    </>
  );
}
