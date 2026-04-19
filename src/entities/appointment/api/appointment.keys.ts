export const appointmentKeys = {
  all: () => ["appointment"] as const,
  lists: () => [...appointmentKeys.all(), "list"] as const,
  list: () => [...appointmentKeys.lists()] as const,
  details: () => [...appointmentKeys.all(), "detail"] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
} as const;
