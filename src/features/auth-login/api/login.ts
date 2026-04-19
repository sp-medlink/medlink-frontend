"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api";
import { decodeJwt } from "@/shared/lib";
import { fetchMe, sessionKeys, useSessionStore } from "@/entities/session";
import type { LoginFormValues } from "../model/schema";

interface LoginApiResponse {
  token: string;
  token_type: "Bearer";
  expires_in: number;
}

export async function loginRequest(values: LoginFormValues): Promise<LoginApiResponse> {
  return apiFetch<LoginApiResponse>("/user/login", {
    method: "POST",
    skipAuth: true,
    json: {
      email_or_phone_or_iin: values.emailOrPhoneOrIin,
      password: values.password,
    },
  });
}

export function useLoginMutation() {
  const setToken = useSessionStore((s) => s.setToken);
  const setUser = useSessionStore((s) => s.setUser);
  const clear = useSessionStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (values: LoginFormValues) => {
      const { token, expires_in } = await loginRequest(values);

      const decoded = decodeJwt(token);
      const expiresAt = decoded?.exp ?? Math.floor(Date.now() / 1000) + expires_in;
      setToken(token, expiresAt);

      const user = await fetchMe();
      setUser(user);
      queryClient.setQueryData(sessionKeys.me(), user);

      return user;
    },
    onError: () => {
      clear();
    },
  });
}
