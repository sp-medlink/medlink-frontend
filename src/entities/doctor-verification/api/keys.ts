import type { VerificationStatus } from "../model/types";

export const doctorVerificationKeys = {
  all: () => ["doctor-verification"] as const,
  list: (status: VerificationStatus | "all" = "all") =>
    [...doctorVerificationKeys.all(), "list", status] as const,
  detail: (doctorId: string) =>
    [...doctorVerificationKeys.all(), "detail", doctorId] as const,
} as const;
