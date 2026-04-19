"use client";

import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { useCreateOrganizationAsPlatformAdminMutation } from "../api/mutations";
import {
  platformOrganizationFormSchema,
  type OrganizationFormValues,
  type PlatformOrganizationFormValues,
} from "../model/schema";
import { OrganizationFormFields } from "./organization-form-fields";

const defaultValues: PlatformOrganizationFormValues = {
  name: "",
  uin: "",
  address: "",
  phoneNumber: "",
  launchDate: new Date().toISOString().slice(0, 10),
  workingHours: "",
  avatarPath: "",
  initialAdminUserId: "",
};

/**
 * Platform-admin-scope create dialog. Distinct from the org-admin
 * variant in one important way: the caller does NOT become the org's
 * first admin — they must paste the target user's ID explicitly. That
 * user is auto-elevated to the `admin` base role server-side if they
 * don't already hold it.
 *
 * The paste-user-ID input is the fastest path to functional; a proper
 * user picker (search by name/email) is a next-step polish item that
 * reuses `/user/admin/users` once we wire a search endpoint.
 */
export function PlatformOrganizationCreateDialog() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateOrganizationAsPlatformAdminMutation();

  const form = useForm<PlatformOrganizationFormValues>({
    resolver: zodResolver(platformOrganizationFormSchema),
    defaultValues,
  });
  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        avatar_path: values.avatarPath,
        name: values.name,
        uin: values.uin,
        address: values.address,
        phone_number: values.phoneNumber,
        launch_date: values.launchDate,
        working_hours: values.workingHours,
        initial_admin_user_id: values.initialAdminUserId,
      });
      toast.success("Organization created");
      form.reset(defaultValues);
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not create organization";
      toast.error(message);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 size-4" aria-hidden />
          New organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New organization</DialogTitle>
          <DialogDescription>
            You will not become an admin of this org — paste the user ID
            of the person who will own it as its first admin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <OrganizationFormFields
            // The platform form schema is a strict superset of the base
            // schema, so the shared fields layer works unchanged.
            form={form as unknown as UseFormReturn<OrganizationFormValues>}
            disabled={mutation.isPending}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-initial-admin">Initial admin (user ID)</Label>
            <Input
              id="org-initial-admin"
              placeholder="00000000-0000-0000-0000-000000000000"
              disabled={mutation.isPending}
              aria-invalid={!!errors.initialAdminUserId}
              {...register("initialAdminUserId")}
            />
            {errors.initialAdminUserId ? (
              <p className="text-destructive text-xs">
                {errors.initialAdminUserId.message}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Find the user on the Users page and copy their ID.
                They&apos;ll be granted the admin base role automatically if
                they don&apos;t have it yet.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
