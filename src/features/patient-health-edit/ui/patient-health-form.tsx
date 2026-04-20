"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { myHealthQuery } from "@/entities/patient-health";
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

import { useUpdateMyHealthMutation } from "../api/mutations";
import {
  patientHealthSchema,
  type PatientHealthFormInput,
  type PatientHealthFormValues,
} from "../model/schema";

const EMPTY: PatientHealthFormInput = {
  bloodType: "",
  heightCm: null,
  weightKg: null,
  allergies: "",
  chronicConditions: "",
  currentMedications: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  notes: "",
};

/**
 * Patient-facing health profile form. GET /user/me/health auto-upserts
 * an empty row on first read, so we can always bind the form to real
 * data — no nullable-object gymnastics here.
 */
export function PatientHealthForm() {
  const query = useQuery(myHealthQuery());
  const mutation = useUpdateMyHealthMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PatientHealthFormInput, unknown, PatientHealthFormValues>({
    resolver: zodResolver(patientHealthSchema),
    defaultValues: EMPTY,
  });

  // Rehydrate once the fetch lands. We rely on `reset` rather than
  // `defaultValues` so edits after a server-side update aren't lost.
  useEffect(() => {
    if (!query.data) return;
    reset({
      bloodType: query.data.bloodType,
      heightCm: query.data.heightCm,
      weightKg: query.data.weightKg,
      allergies: query.data.allergies,
      chronicConditions: query.data.chronicConditions,
      currentMedications: query.data.currentMedications,
      emergencyContactName: query.data.emergencyContactName,
      emergencyContactPhone: query.data.emergencyContactPhone,
      notes: query.data.notes,
    });
  }, [query.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        blood_type: values.bloodType,
        height_cm: values.heightCm,
        weight_kg: values.weightKg,
        allergies: values.allergies,
        chronic_conditions: values.chronicConditions,
        current_medications: values.currentMedications,
        emergency_contact_name: values.emergencyContactName,
        emergency_contact_phone: values.emergencyContactPhone,
        notes: values.notes,
      });
      toast.success("Health profile saved");
      // Mark the form as clean so the Save button disables again.
      reset(values, { keepValues: true });
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not save",
      );
    }
  });

  const pending = isSubmitting || mutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health profile</CardTitle>
        <CardDescription>
          Basics your doctor sees when you open an appointment. Kept
          private to you until you see a physician.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading profile…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">
            Could not load your profile.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bloodType">Blood type</Label>
                <Input
                  id="bloodType"
                  placeholder="e.g. O+"
                  disabled={pending}
                  {...register("bloodType")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input
                  id="heightCm"
                  type="number"
                  min={30}
                  max={300}
                  disabled={pending}
                  aria-invalid={!!errors.heightCm}
                  {...register("heightCm")}
                />
                {errors.heightCm ? (
                  <p className="text-destructive text-xs">
                    {errors.heightCm.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weightKg">Weight (kg)</Label>
                <Input
                  id="weightKg"
                  type="number"
                  step="0.1"
                  min={1}
                  max={500}
                  disabled={pending}
                  aria-invalid={!!errors.weightKg}
                  {...register("weightKg")}
                />
                {errors.weightKg ? (
                  <p className="text-destructive text-xs">
                    {errors.weightKg.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  rows={3}
                  placeholder="Penicillin, latex…"
                  disabled={pending}
                  {...register("allergies")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chronicConditions">
                  Chronic conditions
                </Label>
                <Textarea
                  id="chronicConditions"
                  rows={3}
                  placeholder="Asthma, hypertension…"
                  disabled={pending}
                  {...register("chronicConditions")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="currentMedications">Current medications</Label>
              <Textarea
                id="currentMedications"
                rows={3}
                placeholder="What you're already taking"
                disabled={pending}
                {...register("currentMedications")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emergencyContactName">
                  Emergency contact name
                </Label>
                <Input
                  id="emergencyContactName"
                  disabled={pending}
                  {...register("emergencyContactName")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emergencyContactPhone">
                  Emergency contact phone
                </Label>
                <Input
                  id="emergencyContactPhone"
                  type="tel"
                  disabled={pending}
                  {...register("emergencyContactPhone")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Anything else worth mentioning"
                disabled={pending}
                {...register("notes")}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={pending || !isDirty}>
                {pending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="mr-2 size-4" aria-hidden />
                )}
                Save profile
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
