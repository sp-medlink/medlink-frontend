/**
 * Base roles stored in the backend's `roles` table. This is the single source
 * of truth for what the backend's RBAC middleware knows about.
 */
export const BASE_ROLES = ["user", "doctor", "admin"] as const;
export type BaseRole = (typeof BASE_ROLES)[number];

/**
 * UI-level role used for routing and copy. We only carry the three stable
 * "who is this user primarily?" answers here. Admin sub-personas
 * (org-admin / dept-admin) are *not* roles in this model — they are
 * capabilities derived from data ownership (`orgs_admins` rows,
 * `doctors_departments.is_dept_admin`). See {@link useAdminCapabilities}.
 */
export const APP_ROLES = ["patient", "doctor", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];
