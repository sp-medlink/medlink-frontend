import { queryOptions } from "@tanstack/react-query";

import { apiFetch, ApiError } from "@/shared/api";

import type { Encounter } from "../model/types";

interface EncounterDto {
  id: string;
  appointment_id: string;
  doctor_id: string;
  note: string;
  diagnosis: string;
  follow_up: string;
  created_at: string;
  updated_at: string;
}

interface GetEncounterResponse {
  encounter: EncounterDto | null;
}

interface UpsertEncounterBody {
  note: string;
  diagnosis: string;
  follow_up: string;
}

function toEncounter(dto: EncounterDto): Encounter {
  return {
    id: dto.id,
    appointmentId: dto.appointment_id,
    doctorId: dto.doctor_id,
    note: dto.note,
    diagnosis: dto.diagnosis,
    followUp: dto.follow_up,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export const encounterKeys = {
  all: () => ["encounter"] as const,
  byAppt: (appointmentId: string) =>
    [...encounterKeys.all(), "by-appt", appointmentId] as const,
};

/**
 * Shared "encounter absent" sentinel — backend returns 404 when the
 * doctor hasn't written notes yet. Converting to `null` keeps the
 * caller free of try/catch boilerplate.
 */
async function fetchOrNull(path: string): Promise<Encounter | null> {
  try {
    const res = await apiFetch<GetEncounterResponse>(path);
    return res.encounter ? toEncounter(res.encounter) : null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/** Doctor-side: fetch the encounter for an appointment in one of their departments. */
export function fetchDoctorEncounter(
  doctorDepartmentId: string,
  appointmentId: string,
): Promise<Encounter | null> {
  return fetchOrNull(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/encounter`,
  );
}

/** Patient-side: fetch the encounter for one of their own appointments. */
export function fetchMyEncounter(
  appointmentId: string,
): Promise<Encounter | null> {
  return fetchOrNull(`/user/me/appointments/${appointmentId}/encounter`);
}

/**
 * Upsert the encounter. Backend accepts both POST and PUT against the
 * same endpoint and treats them identically — we pick PUT because
 * it's semantically the right verb for "make this row look like X"
 * regardless of whether the row already exists.
 */
export async function upsertDoctorEncounter(
  doctorDepartmentId: string,
  appointmentId: string,
  body: UpsertEncounterBody,
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/appointments/${appointmentId}/encounter`,
    {
      method: "PUT",
      json: body,
    },
  );
}

export function doctorEncounterQuery(
  doctorDepartmentId: string,
  appointmentId: string,
) {
  return queryOptions({
    queryKey: encounterKeys.byAppt(appointmentId),
    queryFn: () => fetchDoctorEncounter(doctorDepartmentId, appointmentId),
    staleTime: 30_000,
    enabled: Boolean(doctorDepartmentId && appointmentId),
  });
}

export function myEncounterQuery(appointmentId: string) {
  return queryOptions({
    queryKey: encounterKeys.byAppt(appointmentId),
    queryFn: () => fetchMyEncounter(appointmentId),
    staleTime: 30_000,
    enabled: Boolean(appointmentId),
  });
}
