import type { PatientHealthProfile } from "../model/types";
import type { PatientHealthProfileDto } from "./dto";

export function toPatientHealthProfile(
  dto: PatientHealthProfileDto,
): PatientHealthProfile {
  return {
    userId: dto.user_id,
    bloodType: dto.blood_type,
    heightCm: dto.height_cm,
    weightKg: dto.weight_kg,
    allergies: dto.allergies,
    chronicConditions: dto.chronic_conditions,
    currentMedications: dto.current_medications,
    emergencyContactName: dto.emergency_contact_name,
    emergencyContactPhone: dto.emergency_contact_phone,
    notes: dto.notes,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
