export function ListingGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square w-full rounded-xl bg-neutral-200" />
          <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
          <div className="mt-2 h-3 w-1/3 rounded bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
