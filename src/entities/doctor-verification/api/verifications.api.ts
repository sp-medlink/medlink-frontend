import { apiFetch } from "@/shared/api";

import type { DoctorVerification, VerificationStatus } from "../model/types";
import type {
  DoctorVerificationDto,
  DoctorVerificationsListResponse,
  RejectVerificationBody,
  RevokeVerificationBody,
} from "./dto";
import { toDoctorVerification } from "./mapper";

/**
 * Fetches the doctor verification queue. Pass `status` to filter
 * server-side; omit for everything (pending triage + historical).
 */
export async function fetchDoctorVerifications(
  status?: VerificationStatus,
): Promise<DoctorVerification[]> {
  const res = await apiFetch<DoctorVerificationsListResponse>(
    "/user/admin/doctors/verifications",
    {
      query: status ? { verification_status: status } : undefined,
    },
  );
  return res.verifications.map(toDoctorVerification);
}

export async function fetchDoctorVerification(
  doctorId: string,
): Promise<DoctorVerification> {
  // Endpoint returns the bare VerificationInfo (no envelope).
  const res = await apiFetch<DoctorVerificationDto>(
    `/user/admin/doctors/verifications/${doctorId}`,
  );
  return toDoctorVerification(res);
}

export async function approveDoctorVerification(
  doctorId: string,
): Promise<void> {
  await apiFetch(`/user/admin/doctors/verifications/${doctorId}/approve`, {
    method: "POST",
  });
}

export async function rejectDoctorVerification(
  doctorId: string,
  reason: string,
): Promise<void> {
  const body: RejectVerificationBody = { reason };
  await apiFetch(`/user/admin/doctors/verifications/${doctorId}/reject`, {
    method: "POST",
    json: body,
  });
}

export async function revokeDoctorVerification(
  doctorId: string,
  reason: string,
): Promise<void> {
  const body: RevokeVerificationBody = { reason };
  await apiFetch(`/user/admin/doctors/verifications/${doctorId}/revoke`, {
    method: "POST",
    json: body,
  });
}
