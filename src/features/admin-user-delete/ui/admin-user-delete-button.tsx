"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

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

import { useDeleteAdminUserMutation } from "../api/mutations";

interface AdminUserDeleteButtonProps {
  userId: string;
  displayName: string;
  disabled?: boolean;
}

/**
 * Platform-admin-only destructive action. Deletes the user row outright;
 * the backend cascades the blast-radius (orgs_admins rows that would be
 * orphaned, etc.) inside a transaction. Requires explicit confirmation.
 */
export function AdminUserDeleteButton({
  userId,
  displayName,
  disabled,
}: AdminUserDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation = useDeleteAdminUserMutation();

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(userId);
      toast.success(`Deleted ${displayName}`);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not delete user";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Trash2 className="mr-1.5 size-4" aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {displayName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the user account and any orphaned
            admin memberships. Irreversible.
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
            Delete user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
