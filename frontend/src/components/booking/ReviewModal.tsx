"use client";

import { useRef, useState } from "react";
import { Modal } from "../ui/Modal";
import { StarInput } from "../ui/StarRating";
import { bookingsApi, uploadsApi, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  listingTitle: string;
  onSubmitted: () => void;
}

interface PhotoUpload {
  id: string;
  previewUrl: string;
  serverUrl: string | null;
  isUploading: boolean;
  error: boolean;
}

const MAX_PHOTOS = 5;

export function ReviewModal({ isOpen, onClose, bookingId, listingTitle, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const uploadingPhotos = photos.some((p) => p.isUploading);

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setComment("");
    setRating(5);
    setPhotos([]);
  }

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_PHOTOS - photos.length;
    const selected = Array.from(files).slice(0, remainingSlots);

    for (const file of selected) {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { id, previewUrl, serverUrl: null, isUploading: true, error: false }]);

      try {
        const { url } = await uploadsApi.reviewPhoto(file);
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, serverUrl: url, isUploading: false } : p)));
      } catch (err) {
        setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, isUploading: false, error: true } : p)));
        showToast(err instanceof ApiError ? err.message : "Couldn't upload photo", "error");
      }
    }
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const photoUrls = photos.filter((p) => p.serverUrl).map((p) => p.serverUrl as string);
      await bookingsApi.review(bookingId, rating, comment, photoUrls);
      showToast("Thanks for your review!", "success");
      onSubmitted();
      onClose();
      reset();
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

        <div className="w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
                {photo.isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">…</div>
                )}
                {photo.error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">!</div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  aria-label="Remove photo"
                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-[10px] text-white"
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-line text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
              >
                <span className="text-lg leading-none">＋</span>
                <span className="text-[10px]">Add photo</span>
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || uploadingPhotos}
          className="w-full rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Submitting…" : uploadingPhotos ? "Uploading photos…" : "Submit review"}
        </button>
      </form>
    </Modal>
  );
}
