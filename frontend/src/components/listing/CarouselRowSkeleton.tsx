export function CarouselRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: rows }).map((_, r) => (
        <section key={r}>
          <div className="mb-3 h-6 w-64 animate-pulse rounded bg-neutral-200" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[46%] shrink-0 animate-pulse sm:w-[31%] lg:w-[23%] xl:w-[18.5%]">
                <div className="aspect-square w-full rounded-xl bg-neutral-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
