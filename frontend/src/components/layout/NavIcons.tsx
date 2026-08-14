"use client";

interface IconProps {
  className?: string;
}

// Simplified globe, styled after Airbnb's "All" tab icon (gold sphere with meridian lines).
export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill="#DDA520" />
      <ellipse cx="16" cy="16" rx="5.5" ry="13" stroke="#8A6200" strokeWidth="1.4" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="#8A6200" strokeWidth="1.4" />
      <path d="M5 10.5C9 13 23 13 27 10.5" stroke="#8A6200" strokeWidth="1.4" />
      <path d="M5 21.5C9 19 23 19 27 21.5" stroke="#8A6200" strokeWidth="1.4" />
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

