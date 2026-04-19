export interface Appointment {
  id: string;
  userId: string;
  doctorDepartmentId: string;
  doctorAvatarPath: string;
  doctorFirstName: string;
  doctorLastName: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  organizationName: string;
  date: string;
  time: string;
  isOnline: boolean;
  isEnabled: boolean;
  isOnSchedule: boolean;
  createdAt: string;
  updatedAt: string;
}
