"use client";

import type { UseFormReturn } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import type { OrganizationFormValues } from "../model/schema";

interface OrganizationFormFieldsProps {
  // Accepts the base form or any extension of it (the platform-admin
  // variant adds `initialAdminUserId`). Callers with an extended form
  // cast to this widened shape at the call site.
  form: UseFormReturn<OrganizationFormValues>;
  disabled?: boolean;
}

/**
 * Pure presentational field group for an organization create/edit form.
 * Intentionally decoupled from the mutation layer so create and edit forms
 * can share identical inputs.
 */
export function OrganizationFormFields({
  form,
  disabled,
}: OrganizationFormFieldsProps) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="org-name">Name</Label>
        <Input
          id="org-name"
          disabled={disabled}
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name ? (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-uin">UIN</Label>
        <Input
          id="org-uin"
          disabled={disabled}
          aria-invalid={!!errors.uin}
          {...register("uin")}
        />
        {errors.uin ? (
          <p className="text-destructive text-xs">{errors.uin.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-phone">Phone</Label>
        <Input
          id="org-phone"
          type="tel"
          disabled={disabled}
          aria-invalid={!!errors.phoneNumber}
          {...register("phoneNumber")}
        />
        {errors.phoneNumber ? (
          <p className="text-destructive text-xs">
            {errors.phoneNumber.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-launch">Launch date</Label>
        <Input
          id="org-launch"
          type="date"
          disabled={disabled}
          aria-invalid={!!errors.launchDate}
          {...register("launchDate")}
        />
        {errors.launchDate ? (
          <p className="text-destructive text-xs">
            {errors.launchDate.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="org-hours">Working hours</Label>
        <Input
          id="org-hours"
          placeholder="Mon–Fri 09:00–18:00"
          disabled={disabled}
          aria-invalid={!!errors.workingHours}
          {...register("workingHours")}
        />
        {errors.workingHours ? (
          <p className="text-destructive text-xs">
            {errors.workingHours.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="org-avatar">Avatar URL (optional)</Label>
        <Input
          id="org-avatar"
          type="url"
          placeholder="https://…"
          disabled={disabled}
          aria-invalid={!!errors.avatarPath}
          {...register("avatarPath")}
        />
        {errors.avatarPath ? (
          <p className="text-destructive text-xs">
            {errors.avatarPath.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="org-address">Address</Label>
        <Textarea
          id="org-address"
          rows={3}
          disabled={disabled}
          aria-invalid={!!errors.address}
          {...register("address")}
        />
        {errors.address ? (
          <p className="text-destructive text-xs">{errors.address.message}</p>
        ) : null}
      </div>
    </div>
  );
}
