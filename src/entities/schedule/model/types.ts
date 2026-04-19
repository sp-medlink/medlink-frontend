export interface ScheduleSlot {
  id: string;
  doctorDeptId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
