import { z } from "zod";

export const organizationFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  uin: z.string().min(1, "UIN is required").max(50),
  address: z.string().min(1, "Address is required").max(500),
  phoneNumber: z.string().min(1, "Phone is required").max(50),
  launchDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  workingHours: z.string().min(1, "Working hours are required").max(200),
  avatarPath: z
    .string()
    .trim()
    .refine((v) => v === "" || /^https?:\/\//.test(v), {
      message: "Must be an http(s) URL or empty",
    }),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

/**
 * Platform-admin create form extends the shared schema with the UUID of
 * the user who will become the org's first admin. The operator does not
 * self-assign — see {@link useCreateOrganizationAsPlatformAdminMutation}.
 */
export const platformOrganizationFormSchema = organizationFormSchema.extend({
  initialAdminUserId: z
    .string()
    .trim()
    .regex(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      "Must be a valid user UUID",
    ),
});

export type PlatformOrganizationFormValues = z.infer<
  typeof platformOrganizationFormSchema
>;
