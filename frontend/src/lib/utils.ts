import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard shadcn/ui className merge helper — required by vendored shadcn-style
// components (e.g. components/ui/map.tsx) that call cn() internally.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
