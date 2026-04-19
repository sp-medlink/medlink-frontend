export const routes = {
  login: "/login",
  signup: "/signup",
  /** Single profile/settings page for all roles */
  settings: "/settings",
  patient: {
    root: "/patient",
    /** Search doctors by specialty, location (report §3.B.1) */
    doctors: "/patient/doctors",
    appointments: "/patient/appointments",
    /** Telehealth / video visits */
    consultations: "/patient/consultations",
    chats: "/patient/chats",
    /** EMR: history, uploads, shared with doctors */
    records: "/patient/records",
    /** Prescriptions & medical documents */
    documents: "/patient/documents",
    notifications: "/patient/notifications",
  },
  doctor: {
    root: "/doctor",
    verification: "/doctor/verification",
    schedule: "/doctor/schedule",
    appointments: "/doctor/appointments",
    consultations: "/doctor/consultations",
    chats: "/doctor/chats",
    /** Access patient records / encounter context */
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
    verifications: "/admin/verifications",
    organizations: "/admin/organizations",
    departments: "/admin/departments",
    auditLogs: "/admin/audit-logs",
    moderation: "/admin/moderation",
  },
} as const;
