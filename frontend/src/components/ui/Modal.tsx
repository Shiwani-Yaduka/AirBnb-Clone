"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  // Modals can be opened from inside position:sticky ancestors (e.g. the booking
  // sidebar), which always create their own stacking context and would trap a
  // plain nested `fixed` element behind unrelated positioned content elsewhere
  // on the page. Portaling straight to <body> escapes any such ancestor.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`}
      >
        <div className="sticky top-0 flex items-center justify-center border-b border-line bg-white px-4 py-4">
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute left-4 rounded-full p-2 hover:bg-neutral-100"
          >
            ✕
          </button>
          {title && <h2 className="text-base font-semibold">{title}</h2>}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
