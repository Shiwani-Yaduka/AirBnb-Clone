"use client";

import { useEffect, useMemo } from "react";
import { Map, MapControls, useMap } from "@/components/ui/map";
import { PriceMarker } from "@/components/map/PriceMarker";
import type { ListingCard } from "@/lib/types";

interface SearchResultsMapProps {
  listings: ListingCard[];
  activeId: number | null;
  onMarkerHover: (id: number | null) => void;
}

// Fits the map viewport to every marker's coordinates whenever the listing set changes.
function FitBounds({ listings }: { listings: ListingCard[] }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || listings.length === 0) return;
    if (listings.length === 1) {
      map.jumpTo({ center: [listings[0].longitude, listings[0].latitude], zoom: 13 });
      return;
    }
    const lngs = listings.map((l) => l.longitude);
    const lats = listings.map((l) => l.latitude);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 48, duration: 0 },
    );
  }, [map, isLoaded, listings]);

  return null;
}

export default function SearchResultsMap({ listings, activeId, onMarkerHover }: SearchResultsMapProps) {
  const center = useMemo<[number, number]>(() => {
    if (listings.length === 0) return [0, 20];
    return [listings[0].longitude, listings[0].latitude];
  }, [listings]);

  return (
    <Map center={center} zoom={12}>
      <MapControls showZoom showLocate showFullscreen position="top-right" />
      <FitBounds listings={listings} />
      {listings.map((listing) => (
        <PriceMarker
          key={listing.id}
          listing={listing}
          active={activeId === listing.id}
          onHoverChange={(hovering) => onMarkerHover(hovering ? listing.id : null)}
        />
      ))}
    </Map>
  );
}
