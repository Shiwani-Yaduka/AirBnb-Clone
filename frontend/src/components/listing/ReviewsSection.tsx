import type { Review } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { StarRating } from "../ui/StarRating";

export function ReviewsSection({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}) {
  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
        <StarRating rating={rating} reviewCount={reviewCount} size="md" />
        {reviewCount > 0 && <span>· {reviewCount} review{reviewCount > 1 ? "s" : ""}</span>}
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-neutral-500">No reviews yet. Be the first to stay and leave one!</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Avatar name={review.guest_name} src={review.guest_avatar_url} size={40} />
                <div>
                  <p className="text-sm font-semibold">{review.guest_name}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
