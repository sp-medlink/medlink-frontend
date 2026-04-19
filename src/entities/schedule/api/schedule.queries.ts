import { queryOptions } from "@tanstack/react-query";

import {
  fetchDoctorSchedule,
  fetchPublicDoctorSchedule,
} from "./schedule.api";
import { scheduleKeys } from "./schedule.keys";

export const publicDoctorScheduleOptions = (
  organizationId: string,
  departmentId: string,
  doctorDepartmentId: string,
) =>
  queryOptions({
    queryKey: scheduleKeys.public(organizationId, departmentId, doctorDepartmentId),
    queryFn: () =>
      fetchPublicDoctorSchedule(organizationId, departmentId, doctorDepartmentId),
    enabled: Boolean(organizationId && departmentId && doctorDepartmentId),
  });

export const doctorScheduleOptions = (doctorDepartmentId: string) =>
  queryOptions({
    queryKey: scheduleKeys.doctor(doctorDepartmentId),
    queryFn: () => fetchDoctorSchedule(doctorDepartmentId),
    enabled: Boolean(doctorDepartmentId),
  });
