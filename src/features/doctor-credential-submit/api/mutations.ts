"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  doctorVerificationKeys,
  submitMyVerification,
  type SubmitMyVerificationInput,
} from "@/entities/doctor-verification";
import { sessionKeys } from "@/entities/session";

/**
 * Submission covers both first-time creation and resubmission after
 * rejection/revocation — the backend's `POST /user/doctor` overwrites
 * an existing rejected/revoked row in place and resets status to
 * pending. Two caches to invalidate:
 *
 *   1. The `doctor-verification` namespace → status page refetches.
 *   2. The `me` query → a first-time submission grants the `doctor`
 *      base role, and the sidebar + RequireRole guards need to see
 *      that without a full reload.
 */
export function useSubmitMyVerificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["doctor-verification", "submit-mine"],
    mutationFn: (input: SubmitMyVerificationInput) =>
      submitMyVerification(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: doctorVerificationKeys.all(),
      });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.me() });
    },
  });
}
