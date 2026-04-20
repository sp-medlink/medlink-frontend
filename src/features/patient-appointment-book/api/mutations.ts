"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  appointmentKeys,
  createMyAppointment,
} from "@/entities/appointment";

interface BookArgs {
  doctorDepartmentId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM or HH:MM:SS */
  time: string;
  isOnline: boolean;
}

/**
 * Patient-side booking. Backend consumes the selected slot; we invalidate:
 *   - the patient's appointments list (so the new row appears immediately)
 *   - the appointment root namespace (catches available-slots windows keyed
 *     under it — the slot just taken should no longer show up as free).
 */
export function useBookAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["appointment", "book-mine"],
    mutationFn: ({ doctorDepartmentId, date, time, isOnline }: BookArgs) =>
      createMyAppointment({
        doctor_department_id: doctorDepartmentId,
        date,
        time,
        is_online: isOnline,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
      void qc.invalidateQueries({ queryKey: appointmentKeys.all() });
    },
  });
}
