"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api";
import { fetchMe, sessionKeys, useSessionStore } from "@/entities/session";

export interface UpdateProfileRequestBody {
  avatar_path: string;
  first_name: string;
  last_name: string;
  iin: string;
  phone_number: string;
  email: string;
  birth_date: string;
  gender: string;
  address: string;
}

export async function updateProfileRequest(
  body: UpdateProfileRequestBody,
): Promise<void> {
  await apiFetch("/user/me", {
    method: "PUT",
    json: body,
  });
}

export function useUpdateProfileMutation() {
  const setUser = useSessionStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "update"],
    mutationFn: updateProfileRequest,
    onSuccess: async () => {
      const user = await fetchMe();
      setUser(user);
      queryClient.setQueryData(sessionKeys.me(), user);
    },
  });
}
