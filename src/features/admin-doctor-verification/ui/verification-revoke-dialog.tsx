"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldOff } from "lucide-react";

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

import { useRevokeDoctorVerificationMutation } from "../api/mutations";

interface VerificationRevokeDialogProps {
  doctorId: string;
  displayName: string;
  disabled?: boolean;
}

/**
 * Revoke = undo a previous approval (post-approval license issue, fraud,
 * disciplinary action, etc.). Distinct from reject because the doctor
 * has already been operating on the platform.
 */
export function VerificationRevokeDialog({
  doctorId,
  displayName,
  disabled,
}: VerificationRevokeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const mutation = useRevokeDoctorVerificationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      toast.error("A reason is required");
      return;
    }

    try {
      await mutation.mutateAsync({ doctorId, reason: trimmed });
      toast.success(`Revoked ${displayName}`);
      setReason("");
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not revoke verification";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
        >
          <ShieldOff className="mr-1.5 size-4" aria-hidden />
          Revoke
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke {displayName}?</DialogTitle>
          <DialogDescription>
            Revoking removes this doctor&apos;s approved status. Patients will
            no longer see them and their appointments will pause. The
            reason is stored for audit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="revoke-reason">Reason</Label>
            <Textarea
              id="revoke-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={mutation.isPending}
              placeholder="e.g. License expired and has not been renewed."
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
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              Revoke
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
