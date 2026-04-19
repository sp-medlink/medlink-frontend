"use client";

import { format, parseISO } from "date-fns";
import {
  Calendar,
  Fingerprint,
  Loader2,
  Mail,
  MapPin,
  Shield,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentUser } from "@/entities/session";
import type { BaseRole } from "@/shared/config";
import { env } from "@/shared/config";
import { ApiError } from "@/shared/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";

import { useUpdateProfileMutation } from "../api/update-profile";
import {
  profileSettingsSchema,
  type ProfileSettingsFormValues,
} from "../model/schema";

function birthDateToInput(iso: string): string {
  if (!iso) return "";
  const d = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
}

function normalizeGender(value: string): ProfileSettingsFormValues["gender"] {
  if (value === "male" || value === "female" || value === "other") return value;
  return "other";
}

function resolveAvatarUrl(path: string): string | null {
  const p = path?.trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${env.apiBaseUrl}${p}`;
  return p;
}

function roleBadgeLabel(role: BaseRole): string {
  switch (role) {
    case "doctor":
      return "Doctor";
    case "admin":
      return "Admin";
    case "user":
      return "Patient";
    default:
      return role;
  }
}

function formatMemberSince(iso: string): string {
  try {
    return format(parseISO(iso), "MMMM d, yyyy");
  } catch {
    return "—";
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-xs font-medium" role="alert">
      {message}
    </p>
  );
}

export function ProfileSettingsForm() {
  const user = useCurrentUser();
  const mutation = useUpdateProfileMutation();

  const {
    register,
    control,
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

  const avatarPath = useWatch({ control, name: "avatarPath" });
  const firstNameWatch = useWatch({ control, name: "firstName" });
  const lastNameWatch = useWatch({ control, name: "lastName" });

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
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not save profile";
      toast.error(message);
    }
  });

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const pending = isSubmitting || mutation.isPending;
  const previewUrl = resolveAvatarUrl(avatarPath ?? "");
  const initials = `${firstNameWatch?.trim().charAt(0) ?? ""}${lastNameWatch?.trim().charAt(0) ?? ""}`.toUpperCase() || "?";
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Card className="overflow-hidden shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="border-b bg-muted/30 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm">
                <User className="text-muted-foreground size-5" aria-hidden />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">Profile</CardTitle>
                <CardDescription>
                  Photo, display name, and account identifiers.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {user.roles.map((r) => (
                <Badge key={r} variant="outline" className="font-normal">
                  {roleBadgeLabel(r)}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-3.5 opacity-70" aria-hidden />
              <span>
                User ID{" "}
                <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground/90">
                  {user.id}
                </code>
              </span>
            </span>
            <span
              className="text-muted-foreground hidden sm:inline"
              aria-hidden
            >
              ·
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 opacity-70" aria-hidden />
              Member since {formatMemberSince(user.createdAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex flex-col items-center gap-3 lg:w-44">
              <Avatar className="ring-background size-28 ring-4 ring-offset-2 ring-offset-background">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="" className="object-cover" />
                ) : null}
                <AvatarFallback className="text-lg font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground text-center text-xs leading-snug">
                Preview updates as you edit the URL below.
              </p>
            </div>

            <div className="grid min-w-0 flex-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="avatarPath" className="text-sm font-medium">
                  Avatar image URL
                  <span className="text-muted-foreground ml-1 font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="avatarPath"
                  type="url"
                  placeholder="https://… or a path on the API"
                  disabled={pending}
                  aria-invalid={!!errors.avatarPath}
                  className="font-mono text-sm"
                  {...register("avatarPath")}
                />
                <FieldError message={errors.avatarPath?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First name
                </Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  disabled={pending}
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  disabled={pending}
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm">
              <Mail className="text-muted-foreground size-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">Contact</CardTitle>
              <CardDescription>
                Email and phone used for notifications and sign-in recovery.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={pending}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              disabled={pending}
              aria-invalid={!!errors.phoneNumber}
              {...register("phoneNumber")}
            />
            <FieldError message={errors.phoneNumber?.message} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm">
              <Fingerprint className="text-muted-foreground size-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">Identity &amp; address</CardTitle>
              <CardDescription>
                Government ID, demographics, and your residential address.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="iin" className="text-sm font-medium">
              IIN
            </Label>
            <Input
              id="iin"
              inputMode="numeric"
              autoComplete="off"
              disabled={pending}
              aria-invalid={!!errors.iin}
              className="tracking-wide"
              {...register("iin")}
            />
            <FieldError message={errors.iin?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="birthDate" className="text-sm font-medium">
              Birth date
            </Label>
            <Input
              id="birthDate"
              type="date"
              disabled={pending}
              aria-invalid={!!errors.birthDate}
              {...register("birthDate")}
            />
            <FieldError message={errors.birthDate?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gender" className="text-sm font-medium">
              Gender
            </Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={pending}
                >
                  <SelectTrigger
                    id="gender"
                    className="w-full"
                    aria-invalid={!!errors.gender}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.gender?.message} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="text-muted-foreground size-3.5" aria-hidden />
              Address
            </Label>
            <Textarea
              id="address"
              rows={4}
              autoComplete="street-address"
              disabled={pending}
              aria-invalid={!!errors.address}
              className="min-h-[100px] resize-y"
              {...register("address")}
            />
            <FieldError message={errors.address?.message} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed shadow-sm ring-1 ring-black/5 dark:ring-white/10">
        <CardFooter className="bg-muted/25 flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-sm">
            {isDirty ? (
              <span>You have unsaved changes.</span>
            ) : (
              <span>All changes saved.</span>
            )}
          </p>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              disabled={pending || !isDirty}
              onClick={() => {
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
              Discard
            </Button>
            <Button type="submit" disabled={pending || !isDirty} className="min-w-36">
              {pending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              Save changes
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
