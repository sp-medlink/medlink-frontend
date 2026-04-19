import { apiFetch } from "@/shared/api";
import type { SessionUser } from "../model/types";
import type { MeApiResponse } from "./dto";
import { toSessionUser } from "./mapper";

export async function fetchMe(): Promise<SessionUser> {
  const res = await apiFetch<MeApiResponse>("/user/me");
  return toSessionUser(res.user);
}
