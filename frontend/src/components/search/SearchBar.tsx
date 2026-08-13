"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";

interface SearchBarProps {
  onSearch?: () => void;
  compact?: boolean;
}

type Field = "where" | "when" | "who" | null;

export function SearchBar({ onSearch, compact = false }: SearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [activeField, setActiveField] = useState<Field>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compact) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveField(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [compact]);

  function handleSearch() {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (range?.from) params.set("check_in", format(range.from, "yyyy-MM-dd"));
    if (range?.to) params.set("check_out", format(range.to, "yyyy-MM-dd"));
    if (guests > 1) params.set("guests", String(guests));
    setActiveField(null);
    router.push(`/?${params.toString()}`);
    onSearch?.();
  }

  const datesLabel =
    range?.from && range?.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d")}`
      : range?.from
        ? format(range.from, "MMM d")
        : null;
  const guestsLabel = guests > 1 ? `${guests} guests` : null;

  if (compact) {
    return (
      <div className="flex w-full flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold">Where</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neutral-800"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold">When</label>
          <DayPicker
            mode="range"
            numberOfMonths={1}
            selected={range}
            onSelect={setRange}
            disabled={{ before: new Date() }}
            classNames={{ selected: "bg-brand text-white", today: "font-bold text-brand" }}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold">Who</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="h-8 w-8 rounded-full border border-neutral-400 disabled:opacity-30"
              disabled={guests <= 1}
            >
              −
            </button>
            <span className="w-4 text-center text-sm">{guests}</span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(16, g + 1))}
              className="h-8 w-8 rounded-full border border-neutral-400"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          🔍 Search
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex w-full max-w-2xl justify-center">
      <div className="flex w-full items-center rounded-full border border-line bg-white shadow-md transition hover:shadow-lg">
        <button
          type="button"
          onClick={() => setActiveField(activeField === "where" ? null : "where")}
          className={`flex-1 rounded-full px-6 py-3 text-left transition ${
            activeField === "where" ? "bg-white shadow-[0_0_0_1px_#dddddd]" : "hover:bg-neutral-100"
          }`}
        >
          <span className="block text-xs font-semibold">Where</span>
          {activeField === "where" ? (
            <input
              autoFocus
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search destinations"
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
          ) : (
            <span className="block truncate text-sm text-neutral-500">{location || "Search destinations"}</span>
          )}
        </button>

        <span className="h-8 w-px bg-line" />

        <button
          type="button"
          onClick={() => setActiveField(activeField === "when" ? null : "when")}
          className={`flex-1 rounded-full px-6 py-3 text-left transition ${
            activeField === "when" ? "bg-white shadow-[0_0_0_1px_#dddddd]" : "hover:bg-neutral-100"
          }`}
        >
          <span className="block text-xs font-semibold">When</span>
          <span className="block truncate text-sm text-neutral-500">{datesLabel ?? "Add dates"}</span>
        </button>

        <span className="h-8 w-px bg-line" />

        <button
          type="button"
          onClick={() => setActiveField(activeField === "who" ? null : "who")}
          className={`flex-1 rounded-full py-3 pl-6 pr-2 text-left transition ${
            activeField === "who" ? "bg-white shadow-[0_0_0_1px_#dddddd]" : "hover:bg-neutral-100"
          }`}
        >
          <span className="flex items-center justify-between gap-2">
            <span>
              <span className="block text-xs font-semibold">Who</span>
              <span className="block truncate text-sm text-neutral-500">{guestsLabel ?? "Add guests"}</span>
            </span>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              aria-label="Search"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg text-white transition hover:bg-brand-dark"
            >
              🔍
            </span>
          </span>
        </button>
      </div>

      {activeField === "when" && (
        <div className="absolute left-1/2 top-full z-30 mt-3 -translate-x-1/2 rounded-2xl border border-line bg-white p-3 shadow-2xl">
          <DayPicker
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            disabled={{ before: new Date() }}
            classNames={{ selected: "bg-brand text-white", today: "font-bold text-brand" }}
          />
          <div className="flex justify-end gap-3 px-2 pb-1">
            <button type="button" className="text-sm font-semibold underline" onClick={() => setRange(undefined)}>
              Clear
            </button>
            <button type="button" className="text-sm font-semibold underline" onClick={() => setActiveField(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {activeField === "who" && (
        <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-2xl border border-line bg-white p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Guests</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                className="h-8 w-8 rounded-full border border-neutral-400 disabled:opacity-30"
                disabled={guests <= 1}
                aria-label="Decrease guests"
              >
                −
              </button>
              <span className="w-4 text-center text-sm">{guests}</span>
              <button
                type="button"
                onClick={() => setGuests((g) => Math.min(16, g + 1))}
                className="h-8 w-8 rounded-full border border-neutral-400"
                aria-label="Increase guests"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
