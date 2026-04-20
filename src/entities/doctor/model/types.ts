export type VerificationStatus = "pending" | "approved" | "rejected" | "revoked";

export interface Doctor {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface DoctorDepartment {
  id: string;
  doctorId: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  organizationName: string;
  position: string;
  description: string;
  apptDurationInMinutes: number;
  isDeptAdmin: boolean;
  rating: number;
  isEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /**
   * Enrichment fields present on org-admin and dept-admin listings —
   * absent on the doctor's own self-serve listing. UI renders
   * gracefully when these are missing.
   */
  userId?: string;
  avatarPath?: string;
  firstName?: string;
  lastName?: string;
  education?: string;
  experience?: string;
}
