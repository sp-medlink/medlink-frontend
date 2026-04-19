import type { DoctorVerification, VerificationStatus } from "../model/types";
import type { DoctorVerificationDto } from "./dto";

function toStatus(raw: string): VerificationStatus {
  switch (raw) {
    case "pending":
    case "approved":
    case "rejected":
    case "revoked":
      return raw;
    default:
      // Backend validates the enum, so this is defensive: treat anything
      // unexpected as `pending` so the row still renders and is triageable.
      return "pending";
  }
}

export function toDoctorVerification(
  api: DoctorVerificationDto,
): DoctorVerification {
  return {
    doctorId: api.doctor_id,
    userId: api.user_id,
    avatarPath: api.avatar_path,
    firstName: api.first_name,
    lastName: api.last_name,
    education: api.education,
    experience: api.experience,
    licenseNumber: api.license_number,
    licenseCountry: api.license_country,
    licenseIssuedAt: api.license_issued_at,
    licenseExpiresAt: api.license_expires_at,
    verificationStatus: toStatus(api.verification_status),
    verifiedBy: api.verified_by,
    verifiedAt: api.verified_at,
    rejectionReason: api.rejection_reason,
    submittedAt: api.submitted_at,
  };
}
