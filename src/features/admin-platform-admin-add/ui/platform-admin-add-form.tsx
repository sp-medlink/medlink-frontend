"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useAddPlatformAdminMutation } from "../api/mutations";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function PlatformAdminAddForm() {
  const [userId, setUserId] = useState("");
  const mutation = useAddPlatformAdminMutation();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = userId.trim();
    if (!UUID_RE.test(trimmed)) {
      toast.error("Enter a valid user UUID");
      return;
    }
    try {
      await mutation.mutateAsync(trimmed);
      toast.success("Platform admin added");
      setUserId("");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not add platform admin";
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
        <Label htmlFor="platform-admin-user-id">User ID</Label>
        <Input
          id="platform-admin-user-id"
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
        Grant admin
      </Button>
    </form>
  );
}
