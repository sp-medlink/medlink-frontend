export interface NotificationDto {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  payload: string;
  read_at: string | null;
  created_at: string;
}

export interface ListNotificationsResponse {
  notifications: NotificationDto[];
}

export interface UnreadCountResponse {
  unread: number;
}
