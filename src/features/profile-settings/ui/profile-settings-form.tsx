"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useCurrentUser } from "@/entities/session";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";

import { useUpdateProfileMutation } from "../api/update-profile";
import { profileSettingsSchema, type ProfileSettingsFormValues } from "../model/schema";

function birthDateToInput(iso: string): string {
  if (!iso) return "";
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
}

function normalizeGender(value: string): ProfileSettingsFormValues["gender"] {
  if (value === "male" || value === "female" || value === "other") return value;
  return "other";
}

export function ProfileSettingsForm() {
  const user = useCurrentUser();
  const mutation = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      avatarPath: "",
      firstName: "",
      lastName: "",
      iin: "",
      phoneNumber: "",
      email: "",
      birthDate: "",
      gender: "other",
      address: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      avatarPath: user.avatarPath ?? "",
      firstName: user.firstName,
      lastName: user.lastName,
      iin: user.iin,
      phoneNumber: user.phoneNumber,
      email: user.email,
      birthDate: birthDateToInput(user.birthDate),
      gender: normalizeGender(user.gender),
      address: user.address,
    });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        avatar_path: values.avatarPath,
        first_name: values.firstName,
        last_name: values.lastName,
        iin: values.iin,
        phone_number: values.phoneNumber,
        email: values.email,
        birth_date: values.birthDate,
        gender: values.gender,
        address: values.address,
      });
      toast.success("Profile saved");
      reset(values);
    } catch (err) {
      const message =
        err instanceof ApiError ? (err.reason ?? err.message) : "Could not save profile";
      toast.error(message);
    }
  });

  if (!user) {
    return (
      <p className="text-muted-foreground text-sm">Loading your profile…</p>
    );
  }

  const pending = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            User ID: <span className="font-mono text-xs">{user.id}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="avatarPath">Avatar image URL (optional)</Label>
            <Input
              id="avatarPath"
              type="url"
              placeholder="https://…"
              disabled={pending}
              aria-invalid={!!errors.avatarPath}
              {...register("avatarPath")}
            />
            {errors.avatarPath ? (
              <p className="text-destructive text-xs">{errors.avatarPath.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              disabled={pending}
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />
            {errors.firstName ? (
              <p className="text-destructive text-xs">{errors.firstName.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              disabled={pending}
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />
            {errors.lastName ? (
              <p className="text-destructive text-xs">{errors.lastName.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={pending}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phoneNumber">Phone</Label>
            <Input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              disabled={pending}
              aria-invalid={!!errors.phoneNumber}
              {...register("phoneNumber")}
            />
            {errors.phoneNumber ? (
              <p className="text-destructive text-xs">{errors.phoneNumber.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="iin">IIN</Label>
            <Input
              id="iin"
              inputMode="numeric"
              autoComplete="off"
              disabled={pending}
              aria-invalid={!!errors.iin}
              {...register("iin")}
            />
            {errors.iin ? (
              <p className="text-destructive text-xs">{errors.iin.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="birthDate">Birth date</Label>
            <Input
              id="birthDate"
              type="date"
              disabled={pending}
              aria-invalid={!!errors.birthDate}
              {...register("birthDate")}
            />
            {errors.birthDate ? (
              <p className="text-destructive text-xs">{errors.birthDate.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              disabled={pending}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              aria-invalid={!!errors.gender}
              {...register("gender")}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender ? (
              <p className="text-destructive text-xs">{errors.gender.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={3}
              autoComplete="street-address"
              disabled={pending}
              aria-invalid={!!errors.address}
              {...register("address")}
            />
            {errors.address ? (
              <p className="text-destructive text-xs">{errors.address.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending || !isDirty}
          onClick={() => {
            if (!user) return;
            reset({
              avatarPath: user.avatarPath ?? "",
              firstName: user.firstName,
              lastName: user.lastName,
              iin: user.iin,
              phoneNumber: user.phoneNumber,
              email: user.email,
              birthDate: birthDateToInput(user.birthDate),
              gender: normalizeGender(user.gender),
              address: user.address,
            });
          }}
        >
          Discard changes
        </Button>
        <Button type="submit" disabled={pending || !isDirty}>
          {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          Save changes
        </Button>
      </div>
    </form>
  );
}
