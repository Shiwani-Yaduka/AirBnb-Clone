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

// Simplified door/house, styled after Airbnb's "Homes" tab icon (teal outline).
export function HomesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 30V13.5a2 2 0 0 1 .78-1.58l8-6.2a2 2 0 0 1 2.44 0l8 6.2A2 2 0 0 1 26 13.5V30"
        stroke="#00A699"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="12.5" y="19" width="7" height="11" rx="1.2" fill="#00A699" />
    </svg>
  );
}

// Simplified hot-air balloon, styled after Airbnb's "Experiences" tab icon.
export function BalloonIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3.5c5.8 0 9.5 5.4 9.5 11 0 5.1-4.2 9-9.5 9s-9.5-3.9-9.5-9c0-5.6 3.7-11 9.5-11Z"
        fill="#E61E4D"
      />
      <path
        d="M12.5 23.5 10.8 28h10.4l-1.7-4.5"
        stroke="#AD1148"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="13" y="28" width="6" height="2.5" rx="1" fill="#7A0C36" />
    </svg>
  );
}

// Simplified concierge bell, styled after Airbnb's "Services" tab icon.
export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 24.5a11.5 11.5 0 0 1 23 0" stroke="#767676" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="2.5" y1="24.5" x2="29.5" y2="24.5" stroke="#767676" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="6.5" r="2.2" fill="#767676" />
    </svg>
  );
}
