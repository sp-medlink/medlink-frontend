export const BASE_ROLES = ["user", "doctor", "admin"] as const;
export type BaseRole = (typeof BASE_ROLES)[number];

export const APP_ROLES = [
  "patient",
  "doctor",
  "dept-admin",
  "org-admin",
  "admin",
] as const;
export type AppRole = (typeof APP_ROLES)[number];
