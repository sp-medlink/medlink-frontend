"use client";

import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";

import { useApproveDoctorVerificationMutation } from "../api/mutations";

interface VerificationApproveButtonProps {
  doctorId: string;
  displayName: string;
  disabled?: boolean;
  size?: "sm" | "default";
}

export function VerificationApproveButton({
  doctorId,
  displayName,
  disabled,
  size = "sm",
}: VerificationApproveButtonProps) {
  const mutation = useApproveDoctorVerificationMutation();

  const handleClick = async () => {
    try {
      await mutation.mutateAsync(doctorId);
      toast.success(`Approved ${displayName}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not approve verification";
      toast.error(message);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      onClick={() => void handleClick()}
      disabled={disabled || mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
      ) : (
        <CheckCircle2 className="mr-1.5 size-4" aria-hidden />
      )}
      Approve
    </Button>
  );
}
