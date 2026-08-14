"use client";

import { useState } from "react";
import { CURATED_PHOTOS } from "@/lib/constants";

interface PhotoUrlPickerProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PhotoUrlPicker({ value, onChange }: PhotoUrlPickerProps) {
  const [customUrl, setCustomUrl] = useState("");

  function toggle(url: string) {
    onChange(value.includes(url) ? value.filter((u) => u !== url) : [...value, url]);
  }

  function addCustomUrl() {
    const trimmed = customUrl.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setCustomUrl("");
    }
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {value.map((url) => (
            <div key={url} className="group relative h-20 w-20 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => toggle(url)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="mb-2 text-sm font-medium">Pick photos</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {CURATED_PHOTOS.map((url) => {
          const isSelected = value.includes(url);
          return (
            <button
              type="button"
              key={url}
              onClick={() => toggle(url)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                isSelected ? "border-brand" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="Or paste an image URL"
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addCustomUrl}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Add
        </button>
      </div>
    </div>
  );
}
