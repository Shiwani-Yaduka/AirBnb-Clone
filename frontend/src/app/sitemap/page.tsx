import Link from "next/link";

export const metadata = { title: "Sitemap — Airbnb Clone" };

const SECTIONS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Homes", href: "/?type=home" },
      { label: "Experiences", href: "/?type=experience" },
      { label: "Services", href: "/?type=service" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Trips", href: "/trips" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    heading: "Hosting",
    links: [
      { label: "Host dashboard", href: "/host" },
      { label: "Create a listing", href: "/host/listings/new" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <h1 className="mb-8 text-2xl font-semibold">Sitemap</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <div key={section.heading}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {section.heading}
            </h2>
            <ul className="flex flex-col gap-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-neutral-700 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
