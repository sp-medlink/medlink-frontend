import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

export interface AvailableSlotsDay {
  /** ISO `YYYY-MM-DD`. */
  date: string;
  /** Free slot start times as `HH:MM:SS`. */
  times: string[];
}

interface AvailableSlotsApiResponse {
  days: AvailableSlotsDay[];
}

interface FetchArgs {
  orgId: string;
  deptId: string;
  doctorDepartmentId: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD (inclusive, backend caps range at 31d)
}

/**
 * Fetches free booking slots for a given doctor-department over a
 * (dateFrom, dateTo) window. Backend computes the intersection of the
 * active schedule grid and existing non-cancelled appointments — the
 * frontend should treat the result as authoritative.
 */
export async function fetchAvailableSlots({
  orgId,
  deptId,
  doctorDepartmentId,
  dateFrom,
  dateTo,
}: FetchArgs): Promise<AvailableSlotsDay[]> {
  const path =
    `/organizations/${orgId}/departments/${deptId}` +
    `/doctors/${doctorDepartmentId}/schedule/available-slots`;
  const res = await apiFetch<AvailableSlotsApiResponse>(path, {
    query: { date_from: dateFrom, date_to: dateTo },
  });
  return res.days ?? [];
}

export const availableSlotsKeys = {
  all: () => ["appointment", "available-slots"] as const,
  range: (docDeptId: string, dateFrom: string, dateTo: string) =>
    [
      ...availableSlotsKeys.all(),
      docDeptId,
      dateFrom,
      dateTo,
    ] as const,
};

/**
 * React Query factory. `staleTime: 30s` keeps the grid responsive
 * while a patient is clicking around without hammering the backend.
 */
export function availableSlotsQuery(args: FetchArgs) {
  return queryOptions({
    queryKey: availableSlotsKeys.range(
      args.doctorDepartmentId,
      args.dateFrom,
      args.dateTo,
    ),
    queryFn: () => fetchAvailableSlots(args),
    staleTime: 30_000,
    enabled: Boolean(
      args.orgId &&
        args.deptId &&
        args.doctorDepartmentId &&
        args.dateFrom &&
        args.dateTo,
    ),
  });
}
