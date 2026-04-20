import { z } from "zod";

/**
 * Zod schema mirroring the backend's `patient_health_profiles` columns.
 * Optional numbers come through as empty strings from the form — we
 * coerce with a preprocessor so the payload matches `number | null`.
 */
const optionalInt = z.preprocess((raw) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : raw;
}, z.number().int().positive().max(300).nullable());

const optionalFloat = z.preprocess((raw) => {
  if (raw === "" || raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : raw;
}, z.number().positive().max(500).nullable());

export const patientHealthSchema = z.object({
  bloodType: z.string().trim().max(8).default(""),
  heightCm: optionalInt,
  weightKg: optionalFloat,
  allergies: z.string().trim().max(4000).default(""),
  chronicConditions: z.string().trim().max(4000).default(""),
  currentMedications: z.string().trim().max(4000).default(""),
  emergencyContactName: z.string().trim().max(200).default(""),
  emergencyContactPhone: z.string().trim().max(50).default(""),
  notes: z.string().trim().max(4000).default(""),
});

export type PatientHealthFormValues = z.output<typeof patientHealthSchema>;
export type PatientHealthFormInput = z.input<typeof patientHealthSchema>;
