import { z } from "zod";

/**
 * Credential submission maps 1-to-1 to `POST /user/doctor`.
 *
 * License dates are optional on the backend but we require issued-at on
 * the form: a license without an issue date is a red flag for the admin
 * reviewer and gives them no basis for cross-checking. Expiry stays
 * optional because some jurisdictions issue non-expiring licenses.
 */
export const doctorCredentialSchema = z
  .object({
    education: z.string().trim().min(1, "Education is required").max(2000),
    experience: z.string().trim().min(1, "Experience is required").max(2000),
    licenseNumber: z
      .string()
      .trim()
      .min(1, "License number is required")
      .max(100),
    licenseCountry: z
      .string()
      .trim()
      .min(2, "Country is required")
      .max(100),
    licenseIssuedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    licenseExpiresAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
      .or(z.literal("")),
  })
  .refine(
    (v) =>
      !v.licenseExpiresAt || v.licenseExpiresAt >= v.licenseIssuedAt,
    { path: ["licenseExpiresAt"], message: "Expiry must be after issue date" },
  );

export type DoctorCredentialFormValues = z.infer<typeof doctorCredentialSchema>;
