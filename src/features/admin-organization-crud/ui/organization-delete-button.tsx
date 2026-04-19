"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import { ApiError } from "@/shared/api";
import { routes } from "@/shared/config";
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

import { useDeleteOrganizationMutation } from "../api/mutations";

interface OrganizationDeleteButtonProps {
  orgId: string;
  orgName: string;
  /** When true, navigate to the org list after successful delete. */
  redirectOnSuccess?: boolean;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "icon";
}

export function OrganizationDeleteButton({
  orgId,
  orgName,
  redirectOnSuccess,
  variant = "outline",
  size = "sm",
}: OrganizationDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const mutation = useDeleteOrganizationMutation();

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(orgId);
      toast.success(`Deleted ${orgName}`);
      setOpen(false);
      if (redirectOnSuccess) {
        router.replace(routes.admin.organizations);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not delete organization";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Trash2 className="mr-1.5 size-4" aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {orgName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the organization and its departments, admins, and
            doctor assignments. This cannot be undone.
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
            Delete organization
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
