"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Map, MapControls, MapClusterLayer } from "@/components/ui/map";
import type { ListingCard } from "@/lib/types";

interface ExploreMapProps {
  listings: ListingCard[];
}

interface ListingPointProps {
  id: number;
}

// Full-viewport map of every currently-relevant listing (all cities at once), with
// clustering so hundreds of pins stay readable zoomed out and resolve into
// individual points as you zoom into a city. Clicking an individual point opens
// that listing; clicking a cluster zooms into it (mapcn's default behavior).
export default function ExploreMap({ listings }: ExploreMapProps) {
  const router = useRouter();

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: listings.map((listing) => ({
        type: "Feature" as const,
        properties: { id: listing.id },
        geometry: { type: "Point" as const, coordinates: [listing.longitude, listing.latitude] },
      })),
    }),
    [listings],
  );

  const center = useMemo<[number, number]>(() => {
    if (listings.length === 0) return [10, 25];
    const avgLng = listings.reduce((sum, l) => sum + l.longitude, 0) / listings.length;
    const avgLat = listings.reduce((sum, l) => sum + l.latitude, 0) / listings.length;
    return [avgLng, avgLat];
  }, [listings]);

  return (
    <Map center={center} zoom={1.5}>
      <MapControls showZoom showLocate showFullscreen position="top-right" />
      <MapClusterLayer<ListingPointProps>
        data={geojson}
        pointColor="#ff385c"
        clusterColors={["#ffb3c1", "#ff385c", "#c81e4d"]}
        onPointClick={(feature) => {
          const id = feature.properties?.id;
          if (id) router.push(`/listings/${id}`);
        }}
      />
    </Map>
  );
}
