"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open:         boolean;
  title:        string;
  description?: string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  onConfirm:    () => void;
  onCancel:     () => void;
  danger?:      boolean;
}

export function ConfirmDialog({
  open, title, description, confirmLabel = "Устгах", cancelLabel = "Цуцлах",
  onConfirm, onCancel, danger = true,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      ref.current?.focus();
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        ref={ref}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 outline-none animate-fade-in"
      >
        <div className="flex items-start gap-4">
          {danger && (
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 id="confirm-title" className="text-base font-semibold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>
        <div className="mt-5 flex gap-3 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
