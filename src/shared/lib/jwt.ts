import { jwtDecode } from "jwt-decode";

interface RawJwtPayload {
  p?: { uid?: string };
  exp: number;
  iat?: number;
}

export interface JwtPayload {
  uid: string;
  exp: number;
  iat?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const raw = jwtDecode<RawJwtPayload>(token);
    if (!raw?.p?.uid || typeof raw.exp !== "number") return null;
    return { uid: raw.p.uid, exp: raw.exp, iat: raw.iat };
  } catch {
    return null;
  }
}

export function isExpired(token: string, skewSeconds = 10): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + skewSeconds;
}
