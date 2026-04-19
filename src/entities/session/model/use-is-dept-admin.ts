"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchIsDeptAdmin } from "../api/dept-admin.api";
import { sessionKeys } from "../api/session.keys";
import { useAppRole, useIsAuthenticated, useIsSessionHydrated } from "./selectors";

/**
 * Probe: does the current user administer at least one department?
 *
 * Only doctors can be dept-admins (it's a flag on `doctors_departments`,
 * whose FK points at `doctors`), so this query only runs when the base
 * app role is `"doctor"`. Platform admins also skip it — they already
 * have blanket access.
 */
export function useIsDeptAdmin() {
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const baseAppRole = useAppRole();

  return useQuery({
    queryKey: sessionKeys.deptAdmin(),
    queryFn: fetchIsDeptAdmin,
    enabled: hydrated && authed && baseAppRole === "doctor",
    staleTime: 5 * 60_000,
  });
}
