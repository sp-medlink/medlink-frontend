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

import { useRemoveDoctorFromDepartmentMutation } from "../api/mutations";

interface DoctorDeptRemoveButtonProps {
  deptId: string;
  docDeptId: string;
  doctorLabel: string;
}

export function DoctorDeptRemoveButton({
  deptId,
  docDeptId,
  doctorLabel,
}: DoctorDeptRemoveButtonProps) {
  const [open, setOpen] = useState(false);
  const mutation = useRemoveDoctorFromDepartmentMutation(deptId);

  const handleConfirm = async () => {
    try {
      await mutation.mutateAsync(docDeptId);
      toast.success(`Removed ${doctorLabel}`);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not remove doctor";
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
        >
          <UserMinus className="mr-1.5 size-4" aria-hidden />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {doctorLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            The doctor will lose their assignment to this department along
            with their schedule and upcoming appointments. This cannot be
            undone.
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
