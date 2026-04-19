export type { Session, SessionUser, AppRole, BaseRole } from "./model/types";
export { useSessionStore, getSessionToken } from "./model/session-store";
export {
  useIsAuthenticated,
  useCurrentUser,
  useHasBaseRole,
  useIsSessionHydrated,
  useAppRole,
  resolveAppRole,
} from "./model/selectors";
export { useIsOrgAdmin } from "./model/use-is-org-admin";
export { useIsDeptAdmin } from "./model/use-is-dept-admin";
export {
  useAdminCapabilities,
  type AdminCapabilities,
} from "./model/use-admin-capabilities";
export { useLandingRoute } from "./model/use-landing-route";
export { fetchMe } from "./api/me.api";
export { fetchIsOrgAdmin } from "./api/org-admin.api";
export { fetchIsDeptAdmin } from "./api/dept-admin.api";
export { sessionKeys } from "./api/session.keys";
export { meQueryOptions } from "./api/session.queries";
export { RequireAuth } from "./ui/require-auth";
export { RequireRole } from "./ui/require-role";
export { RequireAnyAdmin } from "./ui/require-any-admin";
export { RequireOrgAdmin } from "./ui/require-org-admin";
export { RequirePlatformAdmin } from "./ui/require-platform-admin";
export { RedirectIfAuthenticated } from "./ui/redirect-if-authenticated";
