// Flat-design "spilled ice cream" character in the spirit of Airbnb's 404 page —
// an original recreation (not the copyrighted asset) so the page never depends on
// an external URL that could go stale or break.
export function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 380" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* ground shadows */}
      <ellipse cx="140" cy="362" rx="78" ry="11" fill="#e8e8e8" />
      <ellipse cx="252" cy="356" rx="22" ry="7" fill="#e8e8e8" />

      {/* spilled scoop */}
      <path
        d="M232 330c-14 6-26 18-24 28 3 14 24 16 38 10 12-5 20-16 16-26-4-11-18-16-30-12Z"
        fill="#ff385c"
      />
      <circle cx="270" cy="322" r="4" fill="#ff385c" />
      <circle cx="280" cy="336" r="3" fill="#ff385c" />
      <circle cx="215" cy="344" r="3" fill="#ff385c" />

      {/* back arm holding the empty cone */}
      <path d="M198 176c22 6 34 24 34 42" stroke="#ffcdb0" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M222 202 244 246 202 224Z" fill="#f5b93f" />

      {/* legs */}
      <rect x="118" y="272" width="26" height="66" rx="13" fill="#ffcdb0" />
      <rect x="160" y="272" width="26" height="66" rx="13" fill="#ffcdb0" />
      <ellipse cx="131" cy="344" rx="17" ry="10" fill="#0f6d6d" />
      <ellipse cx="173" cy="344" rx="17" ry="10" fill="#0f6d6d" />

      {/* dress */}
      <path d="M104 190c0-16 20-28 48-28s48 12 48 28l10 88c2 14-12 24-58 24s-60-10-58-24Z" fill="#14b8a6" />
      <rect x="100" y="238" width="112" height="20" fill="#7c2d4a" />

      {/* front arm */}
      <path d="M112 186c-20 8-30 26-28 46" stroke="#ffcdb0" strokeWidth="16" strokeLinecap="round" fill="none" />

      {/* neck + head */}
      <rect x="140" y="140" width="24" height="24" fill="#ffcdb0" />
      <circle cx="152" cy="112" r="42" fill="#ffcdb0" />

      {/* hair */}
      <path
        d="M108 108c0-30 20-50 44-50s44 20 44 50c0 6-2 12-4 16-6-10-18-16-40-16s-34 6-40 16c-2-4-4-10-4-16Z"
        fill="#0f6d6d"
      />
      <circle cx="152" cy="46" r="19" fill="#0f6d6d" />
      <path d="M132 76 140 66 148 76 140 86Z" fill="#f5b93f" />

      {/* face */}
      <circle cx="138" cy="112" r="3.2" fill="#3a2b26" />
      <circle cx="166" cy="112" r="3.2" fill="#3a2b26" />
      <ellipse cx="152" cy="130" rx="4" ry="6" fill="#3a2b26" />
      <circle cx="124" cy="122" r="6" fill="#ff8f8f" opacity="0.6" />
      <circle cx="180" cy="122" r="6" fill="#ff8f8f" opacity="0.6" />
    </svg>
  );
}
