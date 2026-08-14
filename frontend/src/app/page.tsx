"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { listingsApi, ApiError } from "@/lib/api";
import type { ListingCard as ListingCardType, Category, CitySection } from "@/lib/types";
import { ListingCard } from "@/components/listing/ListingCard";
import { ListingGridSkeleton } from "@/components/listing/ListingGridSkeleton";
import { ListingCarouselRow } from "@/components/listing/ListingCarouselRow";
import { CarouselRowSkeleton } from "@/components/listing/CarouselRowSkeleton";
import { FilterPanel, EMPTY_FILTERS, type Filters } from "@/components/search/FilterPanel";
import { Pagination } from "@/components/ui/Pagination";

const SearchResultsMap = dynamic(() => import("@/components/search/SearchResultsMap"), { ssr: false });

const PAGE_SIZE = 20;

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") as Category | null;
  const type = searchParams.get("type") as "home" | "experience" | "service" | null;
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<ListingCardType[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sections, setSections] = useState<CitySection[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);
  const [sectionsError, setSectionsError] = useState<string | null>(null);

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const location = searchParams.get("location") ?? undefined;
  const checkIn = searchParams.get("check_in") ?? undefined;
  const checkOut = searchParams.get("check_out") ?? undefined;
  const guests = searchParams.get("guests");

  const activeFilterCount =
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.propertyType ? 1 : 0) +
    filters.amenityIds.length;

  // No search/filter active: show the curated city-carousel homepage instead of a flat results grid.
  const isBrowsing = !location && !checkIn && !checkOut && !guests && !category && activeFilterCount === 0;

  // Reset to page 1 whenever the effective query changes.
  useEffect(() => {
    setPage(1);
  }, [location, checkIn, checkOut, guests, category, filters]);

  useEffect(() => {
    if (isBrowsing) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listingsApi
      .search({
        location,
        check_in: checkIn,
        check_out: checkOut,
        guests: guests ? Number(guests) : undefined,
        min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        property_type: filters.propertyType ?? undefined,
        category: category ?? undefined,
        listing_type: type ?? undefined,
        amenity_ids: filters.amenityIds,
        page,
        page_size: PAGE_SIZE,
      })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Failed to load listings");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isBrowsing, location, checkIn, checkOut, guests, category, filters, page, type]);

  useEffect(() => {
    setHoveredId(null);
  }, [items]);

  useEffect(() => {
    if (!isBrowsing) return;
    let cancelled = false;
    setIsLoadingSections(true);
    setSectionsError(null);

    listingsApi
      .homeSections(type ?? undefined)
      .then((result) => {
        if (!cancelled) setSections(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setSectionsError(err instanceof ApiError ? err.message : "Failed to load listings");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSections(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isBrowsing, type]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
        {!isBrowsing && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              {location && <p className="text-sm text-neutral-500">Showing results for &ldquo;{location}&rdquo;</p>}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md"
            >
              ⚙️ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        )}

        {isBrowsing ? (
          isLoadingSections ? (
            <CarouselRowSkeleton />
          ) : sectionsError ? (
            <p className="py-20 text-center text-neutral-500">{sectionsError}</p>
          ) : (
            <div className="flex flex-col gap-10">
              {sections.map((section) => (
                <ListingCarouselRow
                  key={`${section.city}-${section.country}`}
                  title={
                    type === "experience"
                      ? `Experiences in ${section.city}`
                      : type === "service"
                        ? `Services in ${section.city}`
                        : `Stay in ${section.city}`
                  }
                  listings={section.listings}
                />
              ))}
            </div>
          )
        ) : isLoading ? (
          <ListingGridSkeleton />
        ) : error ? (
          <p className="py-20 text-center text-neutral-500">{error}</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-lg font-semibold">No listings match your search</p>
            <p className="text-sm text-neutral-500">Try adjusting your filters or dates.</p>
          </div>
        ) : (
          <div className="flex gap-8">
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {items.map((listing) => (
                  <div key={listing.id} onMouseEnter={() => setHoveredId(listing.id)} onMouseLeave={() => setHoveredId(null)}>
                    <ListingCard listing={listing} />
                  </div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
            <div className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[42%] max-w-xl shrink-0 overflow-hidden rounded-2xl border border-line lg:block">
              <SearchResultsMap listings={items} activeId={hoveredId} onMarkerHover={setHoveredId} />
            </div>
          </div>
        )}
      </div>

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
        listingType={type ?? undefined}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<ListingGridSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
