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

/**
 * The doctor's own view of their verification state. Backed by
 * `GET /user/doctor/verification`, which is a narrower slice than the
 * admin queue payload (no user profile fields — the doctor already
 * knows who they are).
 */
export interface MyVerification {
  verificationStatus: VerificationStatus;
  licenseNumber: string;
  licenseCountry: string;
  licenseIssuedAt: string | null;
  licenseExpiresAt: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string;
  submittedAt: string;
}

/**
 * Wire format for `POST /user/doctor`. Dates are `YYYY-MM-DD` (backend
 * stores them as SQL DATE). Empty strings on the optional date fields
 * are allowed — backend treats them as unset.
 */
export interface SubmitMyVerificationInput {
  education: string;
  experience: string;
  licenseNumber: string;
  licenseCountry: string;
  licenseIssuedAt: string;
  licenseExpiresAt: string;
}
