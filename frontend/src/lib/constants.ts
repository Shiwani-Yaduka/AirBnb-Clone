import type { Category, PropertyType } from "./types";

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "House",
  apartment: "Apartment",
  guesthouse: "Guesthouse",
  hotel: "Hotel",
  cabin: "Cabin",
  villa: "Villa",
  loft: "Loft",
  treehouse: "Treehouse",
};

export const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  amazing_views: { label: "Amazing views", emoji: "🏞️" },
  beachfront: { label: "Beachfront", emoji: "🏖️" },
  cabins: { label: "Cabins", emoji: "🛖" },
  tiny_homes: { label: "Tiny homes", emoji: "🏠" },
  trending: { label: "Trending", emoji: "🔥" },
  countryside: { label: "Countryside", emoji: "🌾" },
  luxe: { label: "Luxe", emoji: "💎" },
  lakefront: { label: "Lakefront", emoji: "🚤" },
  rooms: { label: "Rooms", emoji: "🛏️" },
  design: { label: "Design", emoji: "🎨" },
};

// Curated, verified-working Unsplash property photos hosts can pick from
// when creating a listing (no file-upload pipeline for this MVP).
const CURATED_PHOTO_IDS = [
  "1502672260266-1c1ef2d93688", "1493809842364-78817add7ffb", "1560448204-e02f11c3d0e2",
  "1522708323590-d24dbb6b0267", "1600585154340-be6161a56a0c", "1571003123894-1f0594d2b5d9",
  "1484154218962-a197022b5858", "1512917774080-9991f1c4c750", "1568605114967-8130f3a36994",
  "1505691938895-1758d7feb511", "1484101403633-562f891dc89a", "1523217582562-09d0def993a6",
  "1512918728675-ed5a9ecdebfd", "1449844908441-8829872d2607", "1554995207-c18c203602cb",
  "1560185127-6ed189bf02f4", "1615874959474-d609969a20ed", "1580587771525-78b9dba3b914",
];

export const CURATED_PHOTOS = CURATED_PHOTO_IDS.map(
  (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`
);

export const AMENITY_ICONS: Record<string, string> = {
  wifi: "📶",
  kitchen: "🍳",
  parking: "🅿️",
  ac: "❄️",
  pool: "🏊",
  hot_tub: "🛁",
  washer: "🧺",
  dryer: "🌀",
  tv: "📺",
  heating: "🔥",
  workspace: "💻",
  fireplace: "🔥",
  gym: "🏋️",
  ev_charger: "🔌",
  bbq: "🍖",
  beach: "🏖️",
  pets: "🐾",
  breakfast: "🥐",
  ski: "⛷️",
  waterfront: "🌊",
};
