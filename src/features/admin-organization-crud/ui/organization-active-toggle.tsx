"use client";

import { toast } from "sonner";

import { ApiError } from "@/shared/api";
import { Switch } from "@/shared/ui/switch";

import { useSetOrganizationActiveMutation } from "../api/mutations";

interface OrganizationActiveToggleProps {
  orgId: string;
  isActive: boolean;
}

/**
 * Controlled toggle bound to the backend's PATCH ..../status endpoint.
 * Optimistic on the local `isActive` prop is not handled here — callers
 * re-render with the refetched value after mutation success.
 */
export function OrganizationActiveToggle({
  orgId,
  isActive,
}: OrganizationActiveToggleProps) {
  const mutation = useSetOrganizationActiveMutation(orgId);

  const onChange = async (next: boolean) => {
    try {
      await mutation.mutateAsync(next);
      toast.success(next ? "Organization enabled" : "Organization disabled");
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
        aria-label={isActive ? "Disable organization" : "Enable organization"}
      />
      <span className="text-muted-foreground text-xs">
        {isActive ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
