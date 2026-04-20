"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  appointmentKeys,
  cancelMyAppointment,
} from "@/entities/appointment";

interface CancelArgs {
  appointmentId: string;
  reason: string;
}

/**
 * Patient-side cancellation — the appointment flips to the `cancelled`
 * terminal state, and the backend releases its slot so the picker
 * shows it as available again. We invalidate:
 *
 *   - the appointment itself (detail view badge),
 *   - the whole list namespace (history views, doctor dashboards),
 *   - every available-slots window (the freed time may be in any of them).
 */
export function useCancelMyAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["appointment", "cancel-mine"],
    mutationFn: ({ appointmentId, reason }: CancelArgs) =>
      cancelMyAppointment(appointmentId, reason),
    onSuccess: (_data, { appointmentId }) => {
      void qc.invalidateQueries({
        queryKey: appointmentKeys.detail(appointmentId),
      });
      void qc.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // `all()` catches the available-slots child keys too since they
      // share the "appointment" root segment.
      void qc.invalidateQueries({ queryKey: appointmentKeys.all() });
    },
  });
}
