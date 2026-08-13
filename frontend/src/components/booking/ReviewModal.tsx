"use client";

import { useState } from "react";
import { Modal } from "../ui/Modal";
import { StarInput } from "../ui/StarRating";
import { bookingsApi, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  listingTitle: string;
  onSubmitted: () => void;
}

export function ReviewModal({ isOpen, onClose, bookingId, listingTitle, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bookingsApi.review(bookingId, rating, comment);
      showToast("Thanks for your review!", "success");
      onSubmitted();
      onClose();
      setComment("");
      setRating(5);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review your stay at ${listingTitle}`}>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <StarInput value={rating} onChange={setRating} />
        <textarea
          required
          minLength={1}
          rows={4}
          placeholder="Share details of your stay..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border border-line p-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </Modal>
  );
}
