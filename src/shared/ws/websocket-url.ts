import { env } from "../config/env";

export function wsUrl(path: string, token?: string | null): string {
  const url = new URL(path, env.wsBaseUrl);
  if (token) url.searchParams.set("token", token);
  return url.toString();
}
