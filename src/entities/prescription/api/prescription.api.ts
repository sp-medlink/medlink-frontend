import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

import type { Prescription } from "../model/types";

interface PrescriptionDto {
  id: string;
  appointment_id: string;
  doctor_id: string;
  drug_name: string;
  dose: string;
  frequency: string;
  duration_days: number | null;
  notes: string;
  created_at: string;
}

interface ListResponse {
  prescriptions: PrescriptionDto[];
}

interface CreateResponse {
  prescription_id: string;
}

export interface CreatePrescriptionBody {
  drug_name: string;
  dose: string;
  frequency: string;
  duration_days: number | null;
  notes: string;
}

function toPrescription(dto: PrescriptionDto): Prescription {
  return {
    id: dto.id,
    appointmentId: dto.appointment_id,
    doctorId: dto.doctor_id,
    drugName: dto.drug_name,
    dose: dto.dose,
    frequency: dto.frequency,
    durationDays: dto.duration_days,
    notes: dto.notes,
    createdAt: dto.created_at,
  };
}

export const prescriptionKeys = {
  all: () => ["prescription"] as const,
  byAppt: (appointmentId: string) =>
    [...prescriptionKeys.all(), "by-appt", appointmentId] as const,
  mine: (limit: number) =>
    [...prescriptionKeys.all(), "mine", limit] as const,
};

/* ---------- Doctor-side ---------------------------------------- */

export async function fetchDoctorPrescriptions(
  doctorDepartmentId: string,
  appointmentId: string,
): Promise<Prescription[]> {
  const res = await apiFetch<ListResponse>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/prescriptions`,
  );
  return (res.prescriptions ?? []).map(toPrescription);
}

export async function createDoctorPrescription(
  doctorDepartmentId: string,
  appointmentId: string,
  body: CreatePrescriptionBody,
): Promise<string> {
  const res = await apiFetch<CreateResponse>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/prescriptions`,
    {
      method: "POST",
      json: body,
    },
  );
  return res.prescription_id;
}

export async function deleteDoctorPrescription(
  doctorDepartmentId: string,
  appointmentId: string,
  prescriptionId: string,
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/prescriptions/${prescriptionId}`,
    { method: "DELETE" },
  );
}

export function doctorPrescriptionsQuery(
  doctorDepartmentId: string,
  appointmentId: string,
) {
  return queryOptions({
    queryKey: prescriptionKeys.byAppt(appointmentId),
    queryFn: () => fetchDoctorPrescriptions(doctorDepartmentId, appointmentId),
    staleTime: 30_000,
    enabled: Boolean(doctorDepartmentId && appointmentId),
  });
}

/* ---------- Patient-side --------------------------------------- */

export async function fetchMyPrescriptionsByAppointment(
  appointmentId: string,
): Promise<Prescription[]> {
  const res = await apiFetch<ListResponse>(
    `/user/me/appointments/${appointmentId}/prescriptions`,
  );
  return (res.prescriptions ?? []).map(toPrescription);
}

export async function fetchMyPrescriptions(
  limit = 100,
): Promise<Prescription[]> {
  const res = await apiFetch<ListResponse>("/user/me/prescriptions", {
    query: { limit },
  });
  return (res.prescriptions ?? []).map(toPrescription);
}

export function myPrescriptionsByAppointmentQuery(appointmentId: string) {
  return queryOptions({
    queryKey: prescriptionKeys.byAppt(appointmentId),
    queryFn: () => fetchMyPrescriptionsByAppointment(appointmentId),
    staleTime: 30_000,
    enabled: Boolean(appointmentId),
  });
}

export function myPrescriptionsFlatQuery(limit = 100) {
  return queryOptions({
    queryKey: prescriptionKeys.mine(limit),
    queryFn: () => fetchMyPrescriptions(limit),
    staleTime: 60_000,
  });
}
