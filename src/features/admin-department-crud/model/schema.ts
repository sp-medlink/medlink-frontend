import { z } from "zod";

export const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  code: z.string().min(1, "Code is required").max(50),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
