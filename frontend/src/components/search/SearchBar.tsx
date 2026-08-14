"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { addDays, format, subDays } from "date-fns";

interface SearchBarProps {
  onSearch?: () => void;
  compact?: boolean;
}

type Field = "where" | "when" | "who" | null;
type DateMode = "dates" | "flexible";

const FLEX_OPTIONS = [
  { label: "Exact dates", days: 0 },
  { label: "± 1 day", days: 1 },
  { label: "± 2 days", days: 2 },
  { label: "± 3 days", days: 3 },
  { label: "± 7 days", days: 7 },
  { label: "± 14 days", days: 14 },
];

// Renders 2 months on wide screens, 1 on narrow ones, so the calendar dropdown
// never overflows a small viewport (react-day-picker has no built-in responsive prop).
function useResponsiveMonthCount(breakpoint = 700) {
  const [count, setCount] = useState(2);
  useEffect(() => {
    function update() {
      setCount(window.innerWidth < breakpoint ? 1 : 2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return count;
}

export function SearchBar({ onSearch, compact = false }: SearchBarProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [dateMode, setDateMode] = useState<DateMode>("dates");
  const [flexDays, setFlexDays] = useState(0);
  const [guests, setGuests] = useState(1);
  const [activeField, setActiveField] = useState<Field>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const monthCount = useResponsiveMonthCount();

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
    const padding = dateMode === "flexible" ? flexDays : 0;
    if (range?.from) params.set("check_in", format(subDays(range.from, padding), "yyyy-MM-dd"));
    if (range?.to) params.set("check_out", format(addDays(range.to, padding), "yyyy-MM-dd"));
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

  const dateModeTabs = (
    <div className="mb-4 flex justify-center">
      <div className="inline-flex rounded-full border border-line bg-neutral-100 p-1">
        {(["dates", "flexible"] as DateMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setDateMode(mode);
              if (mode === "dates") setFlexDays(0);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              dateMode === mode ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );

  const flexPills = dateMode === "flexible" && (
    <div className="scrollbar-none mt-3 flex justify-center gap-2 overflow-x-auto px-1">
      {FLEX_OPTIONS.map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => setFlexDays(opt.days)}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            flexDays === opt.days
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-line text-neutral-700 hover:border-neutral-900"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

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
          {dateModeTabs}
          <div className="scrollbar-none overflow-x-auto">
            <DayPicker
              mode="range"
              numberOfMonths={1}
              selected={range}
              onSelect={setRange}
              disabled={{ before: new Date() }}
              classNames={{ selected: "bg-brand text-white", today: "font-bold text-brand" }}
            />
          </div>
          {flexPills}
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
        <div className="absolute left-1/2 top-full z-30 mt-3 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-x-auto rounded-2xl border border-line bg-white p-4 shadow-2xl">
          {dateModeTabs}
          <DayPicker
            mode="range"
            numberOfMonths={monthCount}
            selected={range}
            onSelect={setRange}
            disabled={{ before: new Date() }}
            classNames={{ selected: "bg-brand text-white", today: "font-bold text-brand" }}
          />
          {flexPills}
          <div className="flex justify-end gap-3 px-2 pb-1 pt-2">
            <button
              type="button"
              className="text-sm font-semibold underline"
              onClick={() => {
                setRange(undefined);
                setFlexDays(0);
              }}
            >
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
