"use client";

import { useId } from "react";

interface IconProps {
  className?: string;
}

// Globe styled after Airbnb's "All" tab icon: a shaded gold sphere (radial gradient +
// specular highlight) with meridian lines, so it reads as 3-D rather than a flat disc.
// Gradient id is unique per instance since desktop/mobile nav can both be in the DOM at once.
export function GlobeIcon({ className }: IconProps) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#F6CE73" />
          <stop offset="55%" stopColor="#DDA520" />
          <stop offset="100%" stopColor="#A06B00" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill={`url(#${gradientId})`} />
      <g fill="none" stroke="#8A6200" strokeWidth="1.3" opacity="0.55">
        <ellipse cx="16" cy="16" rx="5.5" ry="13" />
        <line x1="3" y1="16" x2="29" y2="16" />
        <path d="M5 10.5C9 13 23 13 27 10.5" />
        <path d="M5 21.5C9 19 23 19 27 21.5" />
      </g>
      <ellipse cx="12" cy="10.5" rx="4" ry="2.4" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

// Bottom-tab-bar icons: plain currentColor line art so active/inactive state is one color swap.
export function SearchTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HeartTabIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 20.5S3 15.2 3 9.3C3 6.4 5.3 4 8.2 4c1.7 0 3.2.8 4.1 2.1C13.2 4.8 14.7 4 16.4 4 19.3 4 21 6.4 21 9.3c0 5.9-9 10.7-9 10.7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SuitcaseTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="13" x2="21" y2="13" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PersonTabIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

