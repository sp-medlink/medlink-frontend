export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  /** Raw JSON string — parsed lazily by the UI since shapes vary per action. */
  payload: string;
  createdAt: string;
}
