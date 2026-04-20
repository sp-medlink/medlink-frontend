export type NotificationKind =
  | "appt.created"
  | "appt.confirmed"
  | "appt.completed"
  | "appt.cancelled"
  | "appt.no_show"
  | (string & {});

export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Raw JSON payload — parsed lazily since shapes vary per kind. */
  payload: string;
  /** ISO timestamp; null = unread. */
  readAt: string | null;
  createdAt: string;
}
