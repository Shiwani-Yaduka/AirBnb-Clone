"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/lib/toast-context";

const DESTINATION_TABS = ["Popular", "Arts & culture", "Beach", "Mountains", "Outdoors", "Things to do"] as const;

// Real, seeded cities the search actually returns results for - each link runs a real search.
const DESTINATIONS: { city: string; type: string }[] = [
  { city: "Austin", type: "Apartment rentals" },
  { city: "New York", type: "Monthly Rentals" },
  { city: "Malibu", type: "Villa rentals" },
  { city: "Paris", type: "Holiday rentals" },
  { city: "Tokyo", type: "Apartment rentals" },
  { city: "Ubud", type: "Cottage rentals" },
  { city: "Aspen", type: "House rentals" },
  { city: "Lake Tahoe", type: "Cabin rentals" },
  { city: "Miami", type: "Villa rentals" },
  { city: "London", type: "Monthly Rentals" },
  { city: "Joshua Tree", type: "Holiday rentals" },
  { city: "Nashville", type: "Apartment rentals" },
];

const LINK_COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: "Support",
    links: [
      "Help Centre",
      "Get help with a safety issue",
      "AirCover",
      "Anti-discrimination",
      "Disability support",
      "Cancellation options",
      "Report neighbourhood concern",
    ],
  },
  {
    heading: "Hosting",
    links: [
      "Airbnb your home",
      "Airbnb your experience",
      "Airbnb your service",
      "AirCover for Hosts",
      "Hosting resources",
      "Community forum",
      "Hosting responsibly",
    ],
  },
  {
    heading: "Airbnb",
    links: ["Newsroom", "Careers", "Investors", "Airbnb.org emergency stays"],
  },
];

export function Footer() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<(typeof DESTINATION_TABS)[number]>("Popular");

  return (
    <footer className="mt-auto border-t border-line bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Inspiration for future getaways</h2>

        <div className="scrollbar-none mb-6 flex gap-6 overflow-x-auto border-b border-line">
          {DESTINATION_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 pb-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
          {DESTINATIONS.map(({ city, type }) => (
            <Link key={city} href={`/?location=${encodeURIComponent(city)}`} className="block">
              <span className="block text-sm font-medium text-neutral-900">{city}</span>
              <span className="block text-sm text-neutral-500">{type}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-8">
          {LINK_COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="mb-4 text-sm font-semibold text-neutral-900">{column.heading}</h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => showToast(`${label} coming soon!`, "info")}
                      className="text-left text-sm text-neutral-600 hover:underline"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Airbnb Clone. Built for a fullstack assignment — not affiliated with Airbnb, Inc.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/sitemap" className="hover:underline">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
