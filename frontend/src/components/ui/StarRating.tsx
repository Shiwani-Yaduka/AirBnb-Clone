interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, reviewCount, size = "sm" }: StarRatingProps) {
  const textSize = size === "sm" ? "text-sm" : "text-base";
  if (reviewCount === 0) {
    return <span className={`${textSize} font-medium text-neutral-700`}>New</span>;
  }
  return (
    <span className={`${textSize} flex items-center gap-1 font-medium`}>
      <span aria-hidden>★</span>
      {rating.toFixed(1)}
      {reviewCount !== undefined && <span className="text-neutral-500">({reviewCount})</span>}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1 text-3xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={star <= value ? "text-brand" : "text-neutral-300"}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
