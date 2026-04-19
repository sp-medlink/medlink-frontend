"use client";

import { toast } from "sonner";

import { ApiError } from "@/shared/api";
import { Switch } from "@/shared/ui/switch";

import {
  useSetDepartmentActiveAsDeptAdminMutation,
  useSetDepartmentActiveAsOrgAdminMutation,
} from "../api/mutations";

type Scope =
  | { kind: "org"; orgId: string; deptId: string }
  | { kind: "dept"; deptId: string };

interface DepartmentActiveToggleProps {
  isActive: boolean;
  scope: Scope;
}

export function DepartmentActiveToggle({
  isActive,
  scope,
}: DepartmentActiveToggleProps) {
  const orgMutation = useSetDepartmentActiveAsOrgAdminMutation(
    scope.kind === "org" ? scope.orgId : "",
    scope.kind === "org" ? scope.deptId : "",
  );
  const deptMutation = useSetDepartmentActiveAsDeptAdminMutation(
    scope.kind === "dept" ? scope.deptId : "",
  );
  const mutation = scope.kind === "org" ? orgMutation : deptMutation;

  const onChange = async (next: boolean) => {
    try {
      await mutation.mutateAsync(next);
      toast.success(next ? "Department enabled" : "Department disabled");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not change status";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={onChange}
        disabled={mutation.isPending}
        aria-label={isActive ? "Disable department" : "Enable department"}
      />
      <span className="text-muted-foreground text-xs">
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
