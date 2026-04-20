export interface PatientHealthProfile {
  userId: string;
  bloodType: string;
  heightCm: number | null;
  weightKg: number | null;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
