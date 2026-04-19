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

import { useDeleteDepartmentMutation } from "../api/mutations";

interface DepartmentDeleteButtonProps {
  orgId: string;
  deptId: string;
  deptName: string;
  /** When true, navigate to the org detail after success. */
  redirectOnSuccess?: boolean;
}

export function DepartmentDeleteButton({
  orgId,
  deptId,
  deptName,
  redirectOnSuccess,
}: DepartmentDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const mutation = useDeleteDepartmentMutation(orgId);

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(deptId);
      toast.success(`Deleted ${deptName}`);
      setOpen(false);
      if (redirectOnSuccess) {
        router.replace(`${routes.admin.organizations}/${orgId}`);
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not delete department";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="mr-1.5 size-4" aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {deptName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Doctors assigned to this department will lose their membership.
            This cannot be undone.
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
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
