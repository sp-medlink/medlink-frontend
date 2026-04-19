"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserMinus } from "lucide-react";

import { ApiError } from "@/shared/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";

import { useRemoveOrgAdminMutation } from "../api/mutations";

interface OrgAdminRemoveButtonProps {
  orgId: string;
  userId: string;
  displayName: string;
  /** If true, render as icon-only. Useful in tight table rows. */
  compact?: boolean;
}

export function OrgAdminRemoveButton({
  orgId,
  userId,
  displayName,
  compact,
}: OrgAdminRemoveButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation = useRemoveOrgAdminMutation(orgId);

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(userId);
      toast.success(`Removed ${displayName}`);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not remove admin";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "icon" : "sm"}
          aria-label={`Remove ${displayName}`}
        >
          <UserMinus className={compact ? "size-4" : "mr-1.5 size-4"} aria-hidden />
          {compact ? null : "Remove"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {displayName}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will no longer be able to manage this organization.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            disabled={mutation.isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : null}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
