"use client";

import { Map, MapControls } from "@/components/ui/map";
import { PriceMarker } from "@/components/map/PriceMarker";

interface ListingMapProps {
  id: number;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  title: string;
  price_per_night: number;
  cover_photo_url: string | null;
  rating: number;
  review_count: number;
}

export default function ListingMap(listing: ListingMapProps) {
  const { latitude, longitude, city } = listing;

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-line">
      <Map center={[longitude, latitude]} zoom={14}>
        <MapControls showZoom showFullscreen position="top-right" />
        <PriceMarker listing={listing} withPopup={false} />
      </Map>
      <p className="sr-only">Exact location shown near {city}.</p>
    </div>
  );
}
