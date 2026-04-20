"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createDoctorPrescription,
  deleteDoctorPrescription,
  prescriptionKeys,
  type CreatePrescriptionBody,
} from "@/entities/prescription";

interface CreateArgs {
  doctorDepartmentId: string;
  appointmentId: string;
  body: CreatePrescriptionBody;
}

export function useCreatePrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["prescription", "create"],
    mutationFn: (args: CreateArgs) =>
      createDoctorPrescription(
        args.doctorDepartmentId,
        args.appointmentId,
        args.body,
      ),
    onSuccess: (_, { appointmentId }) => {
      void qc.invalidateQueries({
        queryKey: prescriptionKeys.byAppt(appointmentId),
      });
      void qc.invalidateQueries({ queryKey: prescriptionKeys.all() });
    },
  });
}

interface DeleteArgs {
  doctorDepartmentId: string;
  appointmentId: string;
  prescriptionId: string;
}

export function useDeletePrescriptionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["prescription", "delete"],
    mutationFn: (args: DeleteArgs) =>
      deleteDoctorPrescription(
        args.doctorDepartmentId,
        args.appointmentId,
        args.prescriptionId,
      ),
    onSuccess: (_, { appointmentId }) => {
      void qc.invalidateQueries({
        queryKey: prescriptionKeys.byAppt(appointmentId),
      });
      void qc.invalidateQueries({ queryKey: prescriptionKeys.all() });
    },
  });
}
