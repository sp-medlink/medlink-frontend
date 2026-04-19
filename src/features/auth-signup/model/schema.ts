import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    iin: z
      .string()
      .trim()
      .regex(/^\d{12}$/, "IIN must be 12 digits"),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?\d{7,15}$/, "Enter a valid phone number"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be YYYY-MM-DD"),
    gender: z.enum(["male", "female", "other"]),
    address: z.string().trim().min(1, "Address is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
