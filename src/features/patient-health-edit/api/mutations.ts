"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  patientHealthKeys,
  updateMyHealth,
  type UpdateMyHealthBody,
} from "@/entities/patient-health";

export function useUpdateMyHealthMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["patient-health", "update"],
    mutationFn: (body: UpdateMyHealthBody) => updateMyHealth(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: patientHealthKeys.mine() });
    },
  });
}
