import { env } from "../config/env";
import { ApiError, type HerodotErrorBody } from "./errors";

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;

let getToken: TokenGetter = () => null;
let onUnauthorized: UnauthorizedHandler = () => {};

export function configureApiClient(opts: {
  getToken?: TokenGetter;
  onUnauthorized?: UnauthorizedHandler;
}): void {
  if (opts.getToken) getToken = opts.getToken;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, env.apiBaseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { json, query, skipAuth, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (json !== undefined) finalHeaders.set("Content-Type", "application/json");
  if (!skipAuth) {
    const token = getToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : (rest as RequestInit).body,
  });

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) onUnauthorized();
    const body = isJson ? (payload as HerodotErrorBody) : undefined;
    const message =
      body?.error?.reason ??
      body?.error?.message ??
      (typeof payload === "string" ? payload : response.statusText);
    throw new ApiError(response.status, message, body);
  }

  return payload as T;
}
