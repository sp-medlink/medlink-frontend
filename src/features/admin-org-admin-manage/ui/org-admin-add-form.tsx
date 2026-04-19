"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useAddOrgAdminMutation } from "../api/mutations";

interface OrgAdminAddFormProps {
  orgId: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Small inline form: paste a user id, hit add. Lookup-by-email flows would
 * need a separate backend endpoint we don't have yet.
 */
export function OrgAdminAddForm({ orgId }: OrgAdminAddFormProps) {
  const [userId, setUserId] = useState("");
  const mutation = useAddOrgAdminMutation(orgId);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = userId.trim();
    if (!UUID_RE.test(trimmed)) {
      toast.error("Enter a valid user UUID");
      return;
    }
    try {
      await mutation.mutateAsync(trimmed);
      toast.success("Org admin added");
      setUserId("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not add admin";
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-end"
      noValidate
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor="org-admin-user-id">User ID</Label>
        <Input
          id="org-admin-user-id"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={mutation.isPending}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button type="submit" disabled={mutation.isPending || !userId.trim()}>
        {mutation.isPending ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        ) : (
          <UserPlus className="mr-2 size-4" aria-hidden />
        )}
        Add admin
      </Button>
    </form>
  );
}
