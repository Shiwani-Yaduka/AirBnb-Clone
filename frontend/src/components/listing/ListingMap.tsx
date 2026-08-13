"use client";

import { MapContainer, TileLayer, Circle } from "react-leaflet";

interface ListingMapProps {
  latitude: number;
  longitude: number;
  city: string;
}

export default function ListingMap({ latitude, longitude, city }: ListingMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="h-[400px] w-full overflow-hidden rounded-2xl">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Approximate location circle, not an exact pin, to mirror Airbnb's privacy-conscious map */}
        <Circle center={position} radius={600} pathOptions={{ color: "#ff385c", fillColor: "#ff385c", fillOpacity: 0.2 }} />
      </MapContainer>
      <p className="mt-2 text-xs text-neutral-500">Exact location provided after booking. Approximate area near {city}.</p>
    </div>
  );
}
