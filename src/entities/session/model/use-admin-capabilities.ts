"use client";

import { useAppRole, useIsAuthenticated, useIsSessionHydrated } from "./selectors";
import { useIsOrgAdmin } from "./use-is-org-admin";
import { useIsDeptAdmin } from "./use-is-dept-admin";

export interface AdminCapabilities {
  /** Holds the base `admin` role → can do anything on the platform. */
  platform: boolean;
  /** Administers at least one organization (has a row in `orgs_admins`). */
  anyOrg: boolean;
  /** Administers at least one department (`doctors_departments.is_dept_admin`). */
  anyDept: boolean;
  /** Convenience: any of the above. Used to gate `/admin` access and nav. */
  anyAdmin: boolean;
  /**
   * `true` once we have a definitive answer for *all* capabilities —
   * session hydrated, probes settled (or deliberately skipped). Consumers
   * that redirect based on caps should wait for this to avoid flashing
   * the wrong destination.
   */
  ready: boolean;
}

/**
 * Single entry point for "what admin surfaces can this user reach?".
 *
 * Mirrors the backend's mental model: platform admin is a real role, but
 * org-admin and dept-admin are data relationships — row in `orgs_admins`
 * and boolean column on `doctors_departments` respectively. Each surface
 * is probed independently and cheaply.
 */
export function useAdminCapabilities(): AdminCapabilities {
  const hydrated = useIsSessionHydrated();
  const authed = useIsAuthenticated();
  const baseAppRole = useAppRole();
  const orgAdminQuery = useIsOrgAdmin();
  const deptAdminQuery = useIsDeptAdmin();

  const platform = baseAppRole === "admin";

  // Platform admins short-circuit: we don't probe, so treat org/dept as
  // "true" conceptually (they have access to everything regardless).
  const anyOrg = platform || (orgAdminQuery.data ?? false);
  const anyDept = platform || (deptAdminQuery.data ?? false);
  const anyAdmin = platform || anyOrg || anyDept;

  const orgReady = platform || !orgAdminQuery.isLoading;
  const deptReady = platform || baseAppRole !== "doctor" || !deptAdminQuery.isLoading;
  const ready = hydrated && (!authed || (orgReady && deptReady));

  return { platform, anyOrg, anyDept, anyAdmin, ready };
}
