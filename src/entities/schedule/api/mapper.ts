import type { ScheduleSlot } from "../model/types";
import type { ScheduleSlotApiDto } from "./dto";

function parseTimeToLabel(isoOrTime: string): string {
  const d = new Date(isoOrTime);
  if (!Number.isNaN(d.getTime())) {
    return d.toISOString().slice(11, 16);
  }
  if (/^\d{1,2}:\d{2}/.test(isoOrTime)) {
    return isoOrTime.slice(0, 5);
  }
  return isoOrTime;
}

export function toScheduleSlot(dto: ScheduleSlotApiDto): ScheduleSlot {
  return {
    id: dto.id,
    doctorDeptId: dto.doctor_department_id,
    weekday: dto.weekday,
    startTime: parseTimeToLabel(dto.start_time),
    endTime: parseTimeToLabel(dto.end_time),
    isEnabled: dto.is_enabled,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
