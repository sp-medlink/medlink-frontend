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
  position: string;
  description: string;
  apptDurationInMinutes: number;
  isDeptAdmin: boolean;
  rating: number;
  isEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
