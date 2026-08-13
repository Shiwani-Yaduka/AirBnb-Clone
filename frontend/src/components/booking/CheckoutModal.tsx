"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Modal } from "../ui/Modal";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

const inputClass = "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800";

export function CheckoutModal({
  isOpen,
  onClose,
  checkIn,
  checkOut,
  nights,
  guests,
  nightlyRate,
  subtotal,
  cleaningFee,
  serviceFee,
  total,
  isSubmitting,
  onConfirm,
}: CheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const canSubmit = cardNumber.trim().length >= 12 && expiry.trim().length >= 4 && cvv.trim().length >= 3;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm and pay" maxWidth="max-w-md">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-line p-4">
          <p className="text-sm font-semibold">Trip details</p>
          <p className="mt-1 text-sm text-neutral-600">
            {format(checkIn, "MMM d, yyyy")} – {format(checkOut, "MMM d, yyyy")} · {nights} night{nights > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-neutral-600">
            {guests} guest{guests > 1 ? "s" : ""}
          </p>
        </section>

        <section>
          <p className="mb-3 text-sm font-semibold">Payment method</p>
          <p className="mb-3 text-xs text-neutral-500">
            This is a mocked checkout for the assignment — no real payment is processed. Any values work.
          </p>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Card number"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className={inputClass}
              />
              <input placeholder="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="underline">
              ${nightlyRate.toLocaleString()} x {nights} night{nights > 1 ? "s" : ""}
            </span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Cleaning fee</span>
            <span>${cleaningFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="underline">Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-line pt-3 font-semibold">
            <span>Total (USD)</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </section>

        <button
          onClick={onConfirm}
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {isSubmitting ? "Confirming…" : `Confirm and pay $${total.toFixed(2)}`}
        </button>
      </div>
    </Modal>
  );
}
