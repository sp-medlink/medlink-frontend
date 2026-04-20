export interface PatientHealthProfileDto {
  user_id: string;
  blood_type: string;
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string;
  chronic_conditions: string;
  current_medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface GetMyHealthResponse {
  profile: PatientHealthProfileDto;
}

export interface UpdateMyHealthBody {
  blood_type: string;
  height_cm: number | null;
  weight_kg: number | null;
  allergies: string;
  chronic_conditions: string;
  current_medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  notes: string;
}
