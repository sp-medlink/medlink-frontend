"use client";

import { toast } from "sonner";

import { ApiError } from "@/shared/api";
import { Switch } from "@/shared/ui/switch";

import { useSetDeptAdminMutation } from "../api/mutations";

interface DeptAdminToggleProps {
  orgId: string;
  deptId: string;
  docDeptId: string;
  isDeptAdmin: boolean;
}

export function DeptAdminToggle({
  orgId,
  deptId,
  docDeptId,
  isDeptAdmin,
}: DeptAdminToggleProps) {
  const mutation = useSetDeptAdminMutation(orgId, deptId);

  const onChange = async (next: boolean) => {
    try {
      await mutation.mutateAsync({ docDeptId, isDeptAdmin: next });
      toast.success(
        next ? "Promoted to department admin" : "Department admin removed",
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not change admin status";
      toast.error(message);
    }
  };

  return (
    <Switch
      checked={isDeptAdmin}
      onCheckedChange={onChange}
      disabled={mutation.isPending}
      aria-label={isDeptAdmin ? "Revoke dept-admin" : "Grant dept-admin"}
    />
  );
}
