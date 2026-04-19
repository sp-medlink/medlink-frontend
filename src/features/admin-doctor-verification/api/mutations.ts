"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  approveDoctorVerification,
  doctorVerificationKeys,
  rejectDoctorVerification,
  revokeDoctorVerification,
} from "@/entities/doctor-verification";

/**
 * Invalidates both the filtered and unfiltered verification lists plus
 * the detail cache for a single doctor. We don't know which status
 * bucket the row moved into, so blow the whole namespace and let React
 * Query refetch what's visible.
 */
function invalidateVerificationCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  doctorId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: doctorVerificationKeys.all(),
  });
  void queryClient.invalidateQueries({
    queryKey: doctorVerificationKeys.detail(doctorId),
  });
}

export function useApproveDoctorVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["doctor-verification", "approve"],
    mutationFn: (doctorId: string) => approveDoctorVerification(doctorId),
    onSuccess: (_, doctorId) =>
      invalidateVerificationCaches(queryClient, doctorId),
  });
}

export function useRejectDoctorVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["doctor-verification", "reject"],
    mutationFn: ({
      doctorId,
      reason,
    }: {
      doctorId: string;
      reason: string;
    }) => rejectDoctorVerification(doctorId, reason),
    onSuccess: (_, variables) =>
      invalidateVerificationCaches(queryClient, variables.doctorId),
  });
}

export function useRevokeDoctorVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["doctor-verification", "revoke"],
    mutationFn: ({
      doctorId,
      reason,
    }: {
      doctorId: string;
      reason: string;
    }) => revokeDoctorVerification(doctorId, reason),
    onSuccess: (_, variables) =>
      invalidateVerificationCaches(queryClient, variables.doctorId),
  });
}
