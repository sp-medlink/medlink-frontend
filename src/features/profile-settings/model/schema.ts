import { z } from "zod";

export const profileSettingsSchema = z.object({
  avatarPath: z.string(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  iin: z.string().trim().regex(/^\d{12}$/, "IIN must be 12 digits"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?\d{7,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email"),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  gender: z.enum(["male", "female", "other"]),
  address: z.string().trim().min(1, "Address is required"),
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;
