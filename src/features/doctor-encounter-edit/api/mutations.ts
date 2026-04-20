"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { encounterKeys, upsertDoctorEncounter } from "@/entities/encounter";

interface UpsertArgs {
  doctorDepartmentId: string;
  appointmentId: string;
  note: string;
  diagnosis: string;
  followUp: string;
}

export function useUpsertEncounterMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["encounter", "upsert"],
    mutationFn: (args: UpsertArgs) =>
      upsertDoctorEncounter(args.doctorDepartmentId, args.appointmentId, {
        note: args.note,
        diagnosis: args.diagnosis,
        follow_up: args.followUp,
      }),
    onSuccess: (_, { appointmentId }) => {
      void qc.invalidateQueries({
        queryKey: encounterKeys.byAppt(appointmentId),
      });
    },
  });
}
