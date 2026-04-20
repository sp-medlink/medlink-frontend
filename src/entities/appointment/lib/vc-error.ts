import { ApiError } from "@/shared/api";

/**
 * The backend time-gates VC tokens to `[start-10m, end+10m]`
 * (migration A.3). Mapping the resulting 403 into friendly patient /
 * doctor-facing copy keeps the surface consistent across the two
 * join-call sites that live in different feature folders.
 */
export function formatVCJoinError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403 && /appointment window/i.test(err.reason ?? "")) {
      return "This appointment isn't open yet. You can join 10 minutes before the scheduled time.";
    }
    return err.reason ?? err.message ?? "Could not start the video call.";
  }
  if (err instanceof Error) return err.message;
  return "Could not start the video call.";
}
