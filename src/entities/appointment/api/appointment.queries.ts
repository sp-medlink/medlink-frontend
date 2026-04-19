import { queryOptions } from "@tanstack/react-query";
import { fetchMyAppointment, fetchMyAppointments } from "./appointment.api";
import { appointmentKeys } from "./appointment.keys";

export const appointmentsListOptions = () =>
  queryOptions({
    queryKey: appointmentKeys.list(),
    queryFn: fetchMyAppointments,
  });

export const appointmentDetailOptions = (id: string) =>
  queryOptions({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => fetchMyAppointment(id),
    enabled: !!id,
  });
