"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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

import { useCreateOrganizationMutation } from "../api/mutations";
import {
  organizationFormSchema,
  type OrganizationFormValues,
} from "../model/schema";
import { OrganizationFormFields } from "./organization-form-fields";

const defaultValues: OrganizationFormValues = {
  name: "",
  uin: "",
  address: "",
  phoneNumber: "",
  launchDate: new Date().toISOString().slice(0, 10),
  workingHours: "",
  avatarPath: "",
};

export function OrganizationCreateDialog() {
  const [open, setOpen] = useState(false);
  const mutation = useCreateOrganizationMutation();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues,
  });

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
            You become the first admin of this organization automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <OrganizationFormFields form={form} disabled={mutation.isPending} />

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
