"use client";

import { useState } from "react";
import { toast } from "sonner";

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
} from "@/shared/ui/alert-dialog";
import { Switch } from "@/shared/ui/switch";

import { useSetDoctorDeptActiveMutation } from "../api/mutations";

interface DoctorDeptActiveToggleProps {
  deptId: string;
  docDeptId: string;
  isActive: boolean;
  /** Shown in the confirmation dialog copy to avoid "are you sure?"-soup. */
  doctorName?: string;
}

/**
 * Active toggle for a doctor within a department (dept-admin scope).
 *
 * Activation is one-click (benign). Deactivation is gated by a confirm
 * dialog because it pulls the doctor out of the patient booking funnel
 * and cancels future appointments — a non-trivial side effect that
 * deserves a deliberate click.
 */
export function DoctorDeptActiveToggle({
  deptId,
  docDeptId,
  isActive,
  doctorName,
}: DoctorDeptActiveToggleProps) {
  const mutation = useSetDoctorDeptActiveMutation(deptId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const apply = async (next: boolean) => {
    try {
      await mutation.mutateAsync({ docDeptId, isActive: next });
      toast.success(next ? "Doctor activated" : "Doctor deactivated");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not change doctor status";
      toast.error(message);
    }
  };

  const onChange = (next: boolean) => {
    if (!next && isActive) {
      setConfirmOpen(true);
      return;
    }
    void apply(next);
  };

  const subject = doctorName ? `${doctorName}` : "this doctor";

  return (
    <>
      <Switch
        checked={isActive}
        onCheckedChange={onChange}
        disabled={mutation.isPending}
        aria-label={isActive ? "Deactivate doctor" : "Activate doctor"}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {subject}?</AlertDialogTitle>
            <AlertDialogDescription>
              Patients won&apos;t be able to see or book {subject} in this
              department, and future appointments will be paused. You
              can re-activate any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void apply(false).finally(() => setConfirmOpen(false));
              }}
              disabled={mutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
