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
  deptAdmin: {
    root: "/dept-admin",
    staff: "/dept-admin/staff",
    schedule: "/dept-admin/schedule",
  },
  orgAdmin: {
    root: "/org-admin",
    organizations: "/org-admin/organizations",
    departments: "/org-admin/departments",
    doctors: "/org-admin/doctors",
  },
  admin: {
    root: "/admin",
    verifications: "/admin/verifications",
    organizations: "/admin/organizations",
    departments: "/admin/departments",
    auditLogs: "/admin/audit-logs",
    moderation: "/admin/moderation",
  },
} as const;
