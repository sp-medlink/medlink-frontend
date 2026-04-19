import { queryOptions } from "@tanstack/react-query";

import type { VerificationStatus } from "../model/types";
import {
  fetchDoctorVerification,
  fetchDoctorVerifications,
} from "./verifications.api";
import { doctorVerificationKeys } from "./keys";

export const doctorVerificationsListQuery = (
  status?: VerificationStatus,
) =>
  queryOptions({
    queryKey: doctorVerificationKeys.list(status ?? "all"),
    queryFn: () => fetchDoctorVerifications(status),
    staleTime: 15_000,
  });

export const doctorVerificationDetailQuery = (doctorId: string) =>
  queryOptions({
    queryKey: doctorVerificationKeys.detail(doctorId),
    queryFn: () => fetchDoctorVerification(doctorId),
    staleTime: 15_000,
    enabled: !!doctorId,
  });
