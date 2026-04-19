import { z } from "zod";

export const loginSchema = z.object({
  emailOrPhoneOrIin: z
    .string()
    .trim()
    .min(1, "Email, phone number, or IIN is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
