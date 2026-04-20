"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  doctorProfileKeys,
  submitMyDoctorProfile,
  type SubmitDoctorProfileBody,
} from "@/entities/doctor";

/**
 * Submit (or resubmit) own doctor profile. On success we invalidate
 * the profile query so the UI flips from "form" to "pending status"
 * immediately. The backend also grants the `doctor` role — callers
 * may want to refetch the session `me` too.
 */
export function useSubmitDoctorVerificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["doctor-profile", "submit"],
    mutationFn: (body: SubmitDoctorProfileBody) =>
      submitMyDoctorProfile(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: doctorProfileKeys.all() });
    },
  });
}
