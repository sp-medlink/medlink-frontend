"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchIsOrgAdmin } from "../api/org-admin.api";
import { sessionKeys } from "../api/session.keys";
import { useAppRole, useIsAuthenticated, useIsSessionHydrated } from "./selectors";

/**
 * Probe: does the current user administer at least one organization?
 *
 * Skipped for platform admins — they already have blanket access via the
 * `admin` base role, so the capability answer is implicitly "yes, for
 * everything" and we don't need to ask the server.
 */
export function useIsOrgAdmin() {
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const baseAppRole = useAppRole();

  return useQuery({
    queryKey: sessionKeys.orgAdmin(),
    queryFn: fetchIsOrgAdmin,
    enabled: hydrated && authed && baseAppRole !== "admin",
    staleTime: 5 * 60_000,
  });
}
