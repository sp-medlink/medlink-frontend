"use client";

import { useState, type ReactNode } from "react";
import { Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import { useCancelMyAppointmentMutation } from "../api/mutations";

interface CancelAppointmentDialogProps {
  appointmentId: string;
  /** Custom trigger. Defaults to a destructive outline button. */
  trigger?: ReactNode;
  /** Fires after the mutation resolves — parent may want to close menus. */
  onCancelled?: () => void;
}

/**
 * Two-step cancel: opens a modal, requires a non-empty reason, calls
 * the mutation. The backend returns 400 on an empty reason; we block
 * submit here so that round-trip never happens.
 */
export function CancelAppointmentDialog({
  appointmentId,
  trigger,
  onCancelled,
}: CancelAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const mutation = useCancelMyAppointmentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("A reason is required");
      return;
    }
    try {
      await mutation.mutateAsync({ appointmentId, reason: trimmed });
      toast.success("Appointment cancelled");
      setReason("");
      setOpen(false);
      onCancelled?.();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not cancel appointment";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="destructive" size="sm">
            <Ban className="mr-1.5 size-4" aria-hidden />
            Cancel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this appointment?</DialogTitle>
          <DialogDescription>
            The doctor is notified with the reason you provide. This
            can&apos;t be undone — you&apos;ll need to book a new slot
            if you change your mind.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={mutation.isPending}
              placeholder="e.g. Feeling better, no longer need the visit"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Keep appointment
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending || !reason.trim()}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              Cancel appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
