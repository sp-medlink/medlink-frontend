"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import type { Organization } from "@/entities/organization";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";

import { useUpdateOrganizationMutation } from "../api/mutations";
import {
  organizationFormSchema,
  type OrganizationFormValues,
} from "../model/schema";
import { OrganizationFormFields } from "./organization-form-fields";

function orgToForm(org: Organization): OrganizationFormValues {
  return {
    name: org.name,
    uin: org.uin,
    address: org.address,
    phoneNumber: org.phoneNumber,
    launchDate: org.launchDate?.slice(0, 10) ?? "",
    workingHours: org.workingHours,
    avatarPath: org.avatarPath ?? "",
  };
}

interface OrganizationEditFormProps {
  org: Organization;
}

export function OrganizationEditForm({ org }: OrganizationEditFormProps) {
  const mutation = useUpdateOrganizationMutation(org.id);
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: orgToForm(org),
  });

  useEffect(() => {
    form.reset(orgToForm(org));
  }, [org, form]);

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
      toast.success("Organization saved");
      form.reset(values);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not save organization";
      toast.error(message);
    }
  });

  const pending = mutation.isPending || form.formState.isSubmitting;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <OrganizationFormFields form={form} disabled={pending} />

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !form.formState.isDirty}
          onClick={() => form.reset(orgToForm(org))}
        >
          Discard
        </Button>
        <Button type="submit" disabled={pending || !form.formState.isDirty}>
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
