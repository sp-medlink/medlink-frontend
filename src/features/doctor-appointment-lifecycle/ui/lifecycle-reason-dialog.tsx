"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

interface LifecycleReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  submitLabel: string;
  submitVariant?: "default" | "destructive";
  /** When true, empty reasons are rejected with a red label. */
  requireReason?: boolean;
  pending?: boolean;
  onConfirm: (reason: string) => void;
}

/**
 * Shared reason-capture dialog for cancel + no-show transitions. Lets
 * the caller set copy per action while keeping layout consistent.
 */
export function LifecycleReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  submitVariant = "default",
  requireReason = false,
  pending = false,
  onConfirm,
}: LifecycleReasonDialogProps) {
  const [reason, setReason] = useState("");

  // Reset the textarea whenever the dialog is reopened — old drafts
  // shouldn't leak between different actions.
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const trimmed = reason.trim();
  const disabled = pending || (requireReason && trimmed === "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (disabled) return;
            onConfirm(trimmed);
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lifecycle-reason">
              Reason{requireReason ? "" : " (optional)"}
            </Label>
            <Textarea
              id="lifecycle-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={pending}
              placeholder={
                requireReason
                  ? "Tell the patient why"
                  : "Any context to save on the record"
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant={submitVariant}
              disabled={disabled}
            >
              {pending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
