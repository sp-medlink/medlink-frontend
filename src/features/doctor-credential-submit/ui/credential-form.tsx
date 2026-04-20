"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import { useSubmitMyVerificationMutation } from "../api/mutations";
import {
  doctorCredentialSchema,
  type DoctorCredentialFormValues,
} from "../model/schema";

interface DoctorCredentialFormProps {
  /** Prefilled values when a doctor is resubmitting after rejection. */
  defaultValues?: Partial<DoctorCredentialFormValues>;
  onSubmitted?: () => void;
}

export function DoctorCredentialForm({
  defaultValues,
  onSubmitted,
}: DoctorCredentialFormProps) {
  const mutation = useSubmitMyVerificationMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DoctorCredentialFormValues>({
    resolver: zodResolver(doctorCredentialSchema),
    defaultValues: {
      education: "",
      experience: "",
      licenseNumber: "",
      licenseCountry: "",
      licenseIssuedAt: "",
      licenseExpiresAt: "",
      ...defaultValues,
    },
  });

  const pending = isSubmitting || mutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        education: values.education.trim(),
        experience: values.experience.trim(),
        licenseNumber: values.licenseNumber.trim(),
        licenseCountry: values.licenseCountry.trim(),
        licenseIssuedAt: values.licenseIssuedAt,
        licenseExpiresAt: values.licenseExpiresAt,
      });
      toast.success("Credentials submitted for review");
      onSubmitted?.();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not submit credentials";
      toast.error(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>Doctor credentials</CardTitle>
          <CardDescription>
            A platform admin will review your submission before you can
            see patients. Most reviews take 1–2 business days.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="education">Education</Label>
            <Textarea
              id="education"
              rows={3}
              disabled={pending}
              aria-invalid={!!errors.education}
              placeholder="e.g. MD, Nazarbayev University School of Medicine, 2018"
              {...register("education")}
            />
            {errors.education ? (
              <p className="text-destructive text-xs">
                {errors.education.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              rows={3}
              disabled={pending}
              aria-invalid={!!errors.experience}
              placeholder="Brief summary of clinical experience, specialisations, and current affiliations."
              {...register("experience")}
            />
            {errors.experience ? (
              <p className="text-destructive text-xs">
                {errors.experience.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="licenseNumber">License number</Label>
              <Input
                id="licenseNumber"
                disabled={pending}
                aria-invalid={!!errors.licenseNumber}
                {...register("licenseNumber")}
              />
              {errors.licenseNumber ? (
                <p className="text-destructive text-xs">
                  {errors.licenseNumber.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="licenseCountry">Issuing country</Label>
              <Input
                id="licenseCountry"
                disabled={pending}
                placeholder="e.g. Kazakhstan"
                aria-invalid={!!errors.licenseCountry}
                {...register("licenseCountry")}
              />
              {errors.licenseCountry ? (
                <p className="text-destructive text-xs">
                  {errors.licenseCountry.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="licenseIssuedAt">Issued on</Label>
              <Input
                id="licenseIssuedAt"
                type="date"
                disabled={pending}
                aria-invalid={!!errors.licenseIssuedAt}
                {...register("licenseIssuedAt")}
              />
              {errors.licenseIssuedAt ? (
                <p className="text-destructive text-xs">
                  {errors.licenseIssuedAt.message}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="licenseExpiresAt">
                Expires on{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="licenseExpiresAt"
                type="date"
                disabled={pending}
                aria-invalid={!!errors.licenseExpiresAt}
                {...register("licenseExpiresAt")}
              />
              {errors.licenseExpiresAt ? (
                <p className="text-destructive text-xs">
                  {errors.licenseExpiresAt.message}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="mr-2 size-4" aria-hidden />
          )}
          Submit for review
        </Button>
      </div>
    </form>
  );
}
