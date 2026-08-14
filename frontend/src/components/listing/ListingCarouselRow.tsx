"use client";

import { useEffect, useRef, useState } from "react";
import type { ListingCard as ListingCardType } from "@/lib/types";
import { ListingCard } from "./ListingCard";

interface ListingCarouselRowProps {
  title: string;
  listings: ListingCardType[];
}

function ChevronIcon({ direction, className }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d={direction === "left" ? "M20 4 8.7 15.3a1 1 0 0 0 0 1.4L20 28" : "M12 4l11.3 11.3a1 1 0 0 1 0 1.4L12 28"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Horizontally-scrollable row of listing cards with hover-revealed prev/next arrows, Airbnb-style.
export function ListingCarouselRow({ title, listings }: ListingCarouselRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  function scrollByPage(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold text-neutral-900">{title}</h2>

      <div className="group/row relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-neutral-700 shadow-md transition hover:scale-105 md:flex md:opacity-0 md:group-hover/row:opacity-100"
          >
            <ChevronIcon direction="left" className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%] xl:w-[18.5%]"
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-line bg-white text-neutral-700 shadow-md transition hover:scale-105 md:flex md:opacity-0 md:group-hover/row:opacity-100"
          >
            <ChevronIcon direction="right" className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}
