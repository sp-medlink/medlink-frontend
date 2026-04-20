"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  appointmentKeys,
  setDoctorAppointmentLifecycle,
  type AppointmentStatus,
} from "@/entities/appointment";

interface LifecycleArgs {
  doctorDepartmentId: string;
  appointmentId: string;
  status: AppointmentStatus;
  /** Required for `cancelled`, ignored otherwise. */
  cancellationReason?: string;
}

/**
 * Doctor-driven lifecycle transition. The backend rejects illegal
 * transitions (e.g. going from `completed` back to `scheduled`) —
 * callers should show only the affordances that match the FSM, and
 * treat the ApiError as a defensive catch for race conditions.
 */
export function useSetAppointmentLifecycleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["appointment", "lifecycle"],
    mutationFn: ({
      doctorDepartmentId,
      appointmentId,
      status,
      cancellationReason,
    }: LifecycleArgs) =>
      setDoctorAppointmentLifecycle(
        doctorDepartmentId,
        appointmentId,
        status,
        cancellationReason,
      ),
    onSuccess: (_data, { appointmentId }) => {
      void qc.invalidateQueries({
        queryKey: appointmentKeys.detail(appointmentId),
      });
      void qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // `cancelled` frees a slot — catch the available-slots children too.
      void qc.invalidateQueries({ queryKey: appointmentKeys.all() });
    },
  });
}
