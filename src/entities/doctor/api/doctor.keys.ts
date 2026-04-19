export const doctorProfileKeys = {
  all: () => ["doctor-profile"] as const,
  mine: () => [...doctorProfileKeys.all(), "mine"] as const,
} as const;
