/** Directory: departments of the selected organization */
export function patientOrganisationPath(organizationId: string): string {
  return `/patient/organisations/${organizationId}`;
}

/** Directory: doctors in a department */
export function patientOrganisationDepartmentPath(
  organizationId: string,
  departmentId: string,
): string {
  return `/patient/organisations/${organizationId}/departments/${departmentId}`;
}

export const routes = {
  login: "/login",
  signup: "/signup",
  /** Single profile/settings page for all roles */
  settings: "/settings",
  patient: {
    root: "/patient",
    /** Catalog: organizations (search by name) */
    organisations: "/patient/organisations",
    appointments: "/patient/appointments",
    /** Telehealth / video visits */
    consultations: "/patient/consultations",
    chats: "/patient/chats",
    /** EMR: history, uploads, shared with doctors */
    records: "/patient/records",
    /** Prescriptions & medical documents */
    documents: "/patient/documents",
    notifications: "/patient/notifications",
    /** Plain user's entry point into the doctor-verification submission. */
    becomeDoctor: "/patient/become-doctor",
  },
  doctor: {
    root: "/doctor",
    /**
     * Practice setup: verification + departments + schedule in a single page.
     * Replaces the three separate routes — those now redirect here.
     */
    practice: "/doctor/practice",
    verification: "/doctor/verification",
    schedule: "/doctor/schedule",
    appointments: "/doctor/appointments",
    consultations: "/doctor/consultations",
    chats: "/doctor/chats",
    /** Patient-centric directory aggregated from the doctor's appointments. */
    patients: "/doctor/patients",
    prescriptions: "/doctor/prescriptions",
    /** Orgs / departments the doctor belongs to */
    departments: "/doctor/departments",
  },
  /**
   * Unified admin area. A single surface that adapts to whatever admin
   * capabilities the user has (platform / org / department). There is no
   * separate `/org-admin` or `/dept-admin` route tree — those are not roles,
   * they are data relationships. See {@link useAdminCapabilities}.
   */
  admin: {
    root: "/admin",
    /** Platform admin + org-admin. Scope differs per capability. */
    organizations: "/admin/organizations",
    /** Dept-admin landing; others drill in via an organization. */
    departments: "/admin/departments",
    /** Platform-admin-only: manage the `admin` base role. */
    admins: "/admin/admins",
    /** Platform-admin-only: every registered user (operator oversight). */
    users: "/admin/users",
    /** Platform-admin-only: doctor verification queue + audit trail. */
    verifications: "/admin/verifications",
    /** Platform-admin-only: audit log of privileged actions. */
    audit: "/admin/audit",
  },
} as const;
