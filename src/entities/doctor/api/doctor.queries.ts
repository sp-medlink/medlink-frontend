import { queryOptions } from "@tanstack/react-query";

import { fetchMyDoctorProfile } from "./doctor.api";
import { doctorProfileKeys } from "./doctor.keys";

export const myDoctorProfileOptions = () =>
  queryOptions({
    queryKey: doctorProfileKeys.mine(),
    queryFn: fetchMyDoctorProfile,
  });
