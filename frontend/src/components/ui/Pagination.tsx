interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2 py-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-line px-3 py-2 text-sm disabled:opacity-30"
      >
        ← Prev
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="text-neutral-400">…</span>}
          <button
            onClick={() => onChange(p)}
            className={`h-9 w-9 rounded-full text-sm font-medium ${
              p === page ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-line px-3 py-2 text-sm disabled:opacity-30"
      >
        Next →
      </button>
    </div>
  );
}
