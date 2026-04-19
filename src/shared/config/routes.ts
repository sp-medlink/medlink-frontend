export const routes = {
  login: "/login",
  signup: "/signup",
  patient: {
    root: "/patient",
    appointments: "/patient/appointments",
    chats: "/patient/chats",
  },
  doctor: {
    root: "/doctor",
    verification: "/doctor/verification",
    schedule: "/doctor/schedule",
    appointments: "/doctor/appointments",
    chats: "/doctor/chats",
  },
  deptAdmin: {
    root: "/dept-admin",
  },
  orgAdmin: {
    root: "/org-admin",
  },
  admin: {
    root: "/admin",
    verifications: "/admin/verifications",
  },
} as const;
