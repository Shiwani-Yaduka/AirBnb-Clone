"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { ListingCard } from "@/lib/types";

interface SearchResultsMapProps {
  listings: ListingCard[];
  activeId: number | null;
  onMarkerHover: (id: number | null) => void;
}

// Renders a listing's price as a rounded pill, mirroring Airbnb's map price tags.
// Built as raw HTML (not a React tree) because Leaflet's divIcon renders outside React.
function priceIcon(price: number, active: boolean): L.DivIcon {
  const label = `$${Math.round(price).toLocaleString()}`;
  return L.divIcon({
    className: "price-pin",
    html: `<span class="price-pin-pill${active ? " price-pin-pill--active" : ""}">${label}</span>`,
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}

// Fits the map viewport to every marker's coordinates whenever the listing set changes.
function FitBounds({ listings }: { listings: ListingCard[] }) {
  const map = useMap();
  useEffect(() => {
    if (listings.length === 0) return;
    if (listings.length === 1) {
      map.setView([listings[0].latitude, listings[0].longitude], 13);
      return;
    }
    const bounds = L.latLngBounds(listings.map((l) => [l.latitude, l.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [listings, map]);
  return null;
}

export default function SearchResultsMap({ listings, activeId, onMarkerHover }: SearchResultsMapProps) {
  const router = useRouter();
  const center = useMemo<[number, number]>(() => {
    if (listings.length === 0) return [20, 0];
    return [listings[0].latitude, listings[0].longitude];
  }, [listings]);

  // react-leaflet doesn't diff divIcon contents, so markers are keyed by id+active
  // to force remount when the highlighted pin changes.
  const markersRef = useRef<Record<number, L.Marker | null>>({});

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds listings={listings} />
      {listings.map((listing) => (
        <Marker
          key={`${listing.id}-${activeId === listing.id}`}
          ref={(m) => {
            markersRef.current[listing.id] = m;
          }}
          position={[listing.latitude, listing.longitude]}
          icon={priceIcon(listing.price_per_night, activeId === listing.id)}
          zIndexOffset={activeId === listing.id ? 1000 : 0}
          eventHandlers={{
            mouseover: () => onMarkerHover(listing.id),
            mouseout: () => onMarkerHover(null),
            click: () => router.push(`/listings/${listing.id}`),
          }}
        />
      ))}
    </MapContainer>
  );
}
