import { apiFetch } from "@/shared/api";
import type { Appointment } from "../model/types";
import type {
  AppointmentApiResponse,
  AppointmentsHistoryApiResponse,
} from "./dto";
import { toAppointment } from "./mapper";

export async function fetchMyAppointments(): Promise<Appointment[]> {
  const res = await apiFetch<AppointmentsHistoryApiResponse>("/user/me/appointments");
  return res.appointments.map(toAppointment);
}

export async function fetchMyAppointment(id: string): Promise<Appointment> {
  const res = await apiFetch<AppointmentApiResponse>(`/user/me/appointments/${id}`);
  return toAppointment(res.appointment);
}
