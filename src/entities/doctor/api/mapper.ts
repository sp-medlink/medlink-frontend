import type { Doctor, VerificationStatus } from "../model/types";
import type { DoctorApiDto } from "./dto";

function toVerificationStatus(raw: string): VerificationStatus {
  if (
    raw === "pending" ||
    raw === "approved" ||
    raw === "rejected" ||
    raw === "revoked"
  ) {
    return raw;
  }
  return "pending";
}

export function toDoctor(dto: DoctorApiDto): Doctor {
  return {
    id: dto.id,
    userId: dto.user_id,
    education: dto.education,
    experience: dto.experience,
    licenseNumber: dto.license_number,
    licenseCountry: dto.license_country,
    licenseIssuedAt: dto.license_issued_at,
    licenseExpiresAt: dto.license_expires_at,
    verificationStatus: toVerificationStatus(dto.verification_status),
    verifiedBy: dto.verified_by,
    verifiedAt: dto.verified_at,
    rejectionReason: dto.rejection_reason,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
