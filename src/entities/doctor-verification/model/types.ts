export type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

/**
 * DoctorVerification is the platform-admin's view of a doctor's identity
 * + licensing package. Backed by `/user/admin/doctors/verifications`.
 * Only platform admins can act on this queue; org-admins do not see
 * unverified doctors' uploads.
 */
export interface DoctorVerification {
  doctorId: string;
  userId: string;
  avatarPath: string;
  firstName: string;
  lastName: string;
  education: string;
  experience: string;
  licenseNumber: string;
  licenseCountry: string;
  licenseIssuedAt: string | null;
  licenseExpiresAt: string | null;
  verificationStatus: VerificationStatus;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string;
  submittedAt: string;
}
