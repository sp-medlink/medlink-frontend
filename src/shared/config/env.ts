export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888",
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8888",
} as const;
