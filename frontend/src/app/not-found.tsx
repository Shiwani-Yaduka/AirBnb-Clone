"use client";

import Link from "next/link";
import { useToast } from "@/lib/toast-context";
import { NotFoundIllustration } from "@/components/illustrations/NotFoundIllustration";

const HELP_LINKS: { label: string; href?: string }[] = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/" },
  { label: "Help" },
  { label: "Traveling on Airbnb" },
  { label: "Hosting on Airbnb" },
  { label: "Trust & Safety" },
  { label: "Sitemap", href: "/sitemap" },
];

export default function NotFound() {
  const { showToast } = useToast();

  return (
    <div className="mx-auto flex max-w-5xl flex-col-reverse items-center gap-10 px-4 py-16 sm:px-8 md:flex-row md:justify-between md:gap-16 md:py-28">
      <div className="w-full max-w-md text-center md:text-left">
        <h1 className="text-6xl font-extrabold tracking-tight text-neutral-800 sm:text-7xl">Oops!</h1>
        <p className="mt-4 text-lg text-neutral-700 sm:text-xl">
          We can&apos;t seem to find the page you&apos;re looking for.
        </p>
        <p className="mt-6 text-sm font-semibold text-neutral-900">Error code: 404</p>

        <div className="mt-4 text-sm text-neutral-700">
          <p className="mb-2">Here are some helpful links instead:</p>
          <ul className="flex flex-col items-center gap-1.5 md:items-start">
            {HELP_LINKS.map(({ label, href }) => (
              <li key={label}>
                {href ? (
                  <Link href={href} className="text-teal-700 hover:underline">
                    {label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => showToast(`${label} coming soon!`, "info")}
                    className="text-teal-700 hover:underline"
                  >
                    {label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <NotFoundIllustration className="h-48 w-48 shrink-0 sm:h-64 sm:w-64 md:h-72 md:w-72" />
    </div>
  );
}
