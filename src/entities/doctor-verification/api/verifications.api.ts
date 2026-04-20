import { apiFetch, ApiError } from "@/shared/api";

import type {
  DoctorVerification,
  MyVerification,
  SubmitMyVerificationInput,
  VerificationStatus,
} from "../model/types";
import type {
  DoctorVerificationDto,
  DoctorVerificationsListResponse,
  MyVerificationDto,
  RejectVerificationBody,
  RevokeVerificationBody,
  SubmitMyVerificationBody,
} from "./dto";
import { toDoctorVerification, toMyVerification } from "./mapper";

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

/**
 * Returns the current doctor's own verification record, or `null` if
 * they have not submitted credentials yet. The backend responds 404
 * when no doctor row exists for the caller; we translate that into
 * `null` so callers can branch on "submit form" vs "status view"
 * without inspecting ApiError.
 */
export async function fetchMyVerification(): Promise<MyVerification | null> {
  try {
    const res = await apiFetch<MyVerificationDto>(
      "/user/doctor/verification",
    );
    return toMyVerification(res);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function submitMyVerification(
  input: SubmitMyVerificationInput,
): Promise<void> {
  const body: SubmitMyVerificationBody = {
    education: input.education,
    experience: input.experience,
    license_number: input.licenseNumber,
    license_country: input.licenseCountry,
    license_issued_at: input.licenseIssuedAt,
    license_expires_at: input.licenseExpiresAt,
  };
  await apiFetch("/user/doctor", {
    method: "POST",
    json: body,
  });
}

/**
 * Deletes the caller's doctor profile. Used as the resubmit path:
 * the backend's `POST /user/doctor` conflicts if a row already
 * exists, and it only lets us update `education`/`experience` via
 * PUT — license fields are immutable. So a doctor whose submission
 * was rejected has to delete + recreate to change license data.
 */
export async function deleteMyDoctorProfile(): Promise<void> {
  await apiFetch("/user/doctor", { method: "DELETE" });
}
