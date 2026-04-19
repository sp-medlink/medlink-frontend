"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/api";
import { decodeJwt } from "@/shared/lib";
import {
  fetchMe,
  sessionKeys,
  useSessionStore,
  type SessionUser,
} from "@/entities/session";
import { loginRequest } from "@/features/auth-login";
import type { SignupFormValues } from "../model/schema";

interface SignupApiResponse {
  user_id: string;
}

export async function signupRequest(values: SignupFormValues): Promise<SignupApiResponse> {
  return apiFetch<SignupApiResponse>("/user/signup", {
    method: "POST",
    skipAuth: true,
    json: {
      avatar_path: "",
      first_name: values.firstName,
      last_name: values.lastName,
      iin: values.iin,
      phone_number: values.phoneNumber,
      email: values.email,
      password: values.password,
      birth_date: values.birthDate,
      gender: values.gender,
      address: values.address,
    },
  });
}

export function useSignupMutation() {
  const setToken = useSessionStore((s) => s.setToken);
  const setUser = useSessionStore((s) => s.setUser);
  const clear = useSessionStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "signup"],
    mutationFn: async (values: SignupFormValues): Promise<SessionUser> => {
      await signupRequest(values);

      const { token, expires_in } = await loginRequest({
        emailOrPhoneOrIin: values.email,
        password: values.password,
      });

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
