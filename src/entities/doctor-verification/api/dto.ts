export interface DoctorVerificationDto {
  doctor_id: string;
  user_id: string;
  avatar_path: string;
  first_name: string;
  last_name: string;
  education: string;
  experience: string;
  license_number: string;
  license_country: string;
  license_issued_at: string | null;
  license_expires_at: string | null;
  verification_status: string;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string;
  submitted_at: string;
}

export interface DoctorVerificationsListResponse {
  verifications: DoctorVerificationDto[];
}

export interface RejectVerificationBody {
  reason: string;
}

export interface RevokeVerificationBody {
  reason: string;
}
