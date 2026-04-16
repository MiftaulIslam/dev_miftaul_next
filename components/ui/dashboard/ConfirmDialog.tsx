"use client";

import { Dialog } from "@/components/ui/dashboard/Dialog";
import { Button } from "@/components/ui/dashboard/Button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed text-slate-300">{message}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={danger ? "danger" : "primary"}
          disabled={pending}
          onClick={() => void onConfirm()}
        >
          {pending ? "Please wait…" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
