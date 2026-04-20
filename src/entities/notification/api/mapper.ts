import type { Notification } from "../model/types";
import type { NotificationDto } from "./dto";

export function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    userId: dto.user_id,
    kind: dto.kind,
    title: dto.title,
    body: dto.body ?? "",
    payload: dto.payload ?? "{}",
    readAt: dto.read_at,
    createdAt: dto.created_at,
  };
}
