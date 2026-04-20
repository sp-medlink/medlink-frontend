"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CalendarCheck2,
  CheckCheck,
  Loader2,
  PlayCircle,
  UserMinus,
  type LucideIcon,
} from "lucide-react";

import type { AppointmentStatus } from "@/entities/appointment";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

import { useSetAppointmentLifecycleMutation } from "../api/mutations";
import { allowedTransitions } from "../model/transitions";
import { LifecycleReasonDialog } from "./lifecycle-reason-dialog";

interface LifecycleControlsProps {
  doctorDepartmentId: string;
  appointmentId: string;
  currentStatus: AppointmentStatus;
  /**
   * Appointment date in `YYYY-MM-DD`. When supplied, gates transitions
   * that only make sense once the visit is happening or has passed —
   * e.g. "Start visit" is hidden for appointments still in the future.
   */
  appointmentDate?: string;
  /** Appointment time in `HH:MM` (or ISO-ish). Paired with `appointmentDate`. */
  appointmentTime?: string;
  /** Renders in a vertical column when true (used in compact sidebars). */
  vertical?: boolean;
  className?: string;
}

interface ActionSpec {
  label: string;
  icon: LucideIcon;
  variant: "default" | "outline" | "destructive" | "secondary" | "ghost";
  /** Extra classes merged onto the button — used for destructive-text outlines. */
  extraClass?: string;
  needsReason: boolean;
  reasonRequired: boolean;
  dialogTitle: string;
  dialogDescription: string;
  submitLabel: string;
}

/**
 * Per-status action catalogue. Only the transitions actually offered
 * here are listed — e.g. confirming an already-in-progress visit
 * isn't a thing the doctor sees. The hard list comes from the
 * transitions model, but copy lives here.
 */
const ACTION_SPECS: Record<AppointmentStatus, ActionSpec> = {
  confirmed: {
    label: "Confirm",
    icon: CalendarCheck2,
    variant: "default",
    needsReason: false,
    reasonRequired: false,
    dialogTitle: "",
    dialogDescription: "",
    submitLabel: "",
  },
  in_progress: {
    label: "Start visit",
    icon: PlayCircle,
    variant: "outline",
    needsReason: false,
    reasonRequired: false,
    dialogTitle: "",
    dialogDescription: "",
    submitLabel: "",
  },
  completed: {
    label: "Complete",
    icon: CheckCheck,
    variant: "default",
    needsReason: false,
    reasonRequired: false,
    dialogTitle: "",
    dialogDescription: "",
    submitLabel: "",
  },
  cancelled: {
    label: "Cancel",
    icon: Ban,
    variant: "ghost",
    extraClass:
      "text-destructive hover:bg-destructive/10 hover:text-destructive",
    needsReason: true,
    reasonRequired: true,
    dialogTitle: "Cancel this appointment?",
    dialogDescription:
      "The patient is notified with your reason. The slot is released for rebooking immediately.",
    submitLabel: "Cancel appointment",
  },
  no_show: {
    label: "No-show",
    icon: UserMinus,
    variant: "ghost",
    extraClass: "text-muted-foreground",
    needsReason: true,
    reasonRequired: false,
    dialogTitle: "Mark as no-show?",
    dialogDescription:
      "Recorded when the patient didn't attend. A short note helps a future reviewer.",
    submitLabel: "Mark no-show",
  },
  // scheduled is never a *target* in the doctor-driven FSM.
  scheduled: {
    label: "Reopen",
    icon: CalendarCheck2,
    variant: "outline",
    needsReason: false,
    reasonRequired: false,
    dialogTitle: "",
    dialogDescription: "",
    submitLabel: "",
  },
};

/**
 * Inline control bar for the doctor's appointment card. Shows only
 * the transitions valid from the current status, and routes the
 * cancel / no-show actions through the reason dialog.
 */
function isDateTodayOrPast(date: string | undefined): boolean {
  if (!date) return true;
  const m = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return true;
  const target = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
  ).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return target <= today.getTime();
}

function isDatetimePast(
  date: string | undefined,
  time: string | undefined,
): boolean {
  if (!date) return false;
  const d = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!d) return false;
  const t = (time ?? "").match(/^(\d{2}):(\d{2})/);
  const when = new Date(
    Number(d[1]),
    Number(d[2]) - 1,
    Number(d[3]),
    t ? Number(t[1]) : 23,
    t ? Number(t[2]) : 59,
  );
  return when.getTime() < Date.now();
}

export function LifecycleControls({
  doctorDepartmentId,
  appointmentId,
  currentStatus,
  appointmentDate,
  appointmentTime,
  vertical = false,
  className,
}: LifecycleControlsProps) {
  const mutation = useSetAppointmentLifecycleMutation();
  const [pendingTarget, setPendingTarget] =
    useState<AppointmentStatus | null>(null);

  // "Complete" is the natural next step from confirmed, so we gate it
  // on the appointment having actually happened (today or past). No-show
  // needs the slot to already be past.
  const transitions = allowedTransitions(currentStatus).filter((t) => {
    if (
      t === "completed" &&
      currentStatus === "confirmed" &&
      !isDateTodayOrPast(appointmentDate)
    ) {
      return false;
    }
    if (t === "no_show" && !isDatetimePast(appointmentDate, appointmentTime)) {
      return false;
    }
    return true;
  });
  if (transitions.length === 0) return null;

  const runTransition = async (
    target: AppointmentStatus,
    reason: string | null,
  ) => {
    try {
      await mutation.mutateAsync({
        doctorDepartmentId,
        appointmentId,
        status: target,
        cancellationReason: reason ?? undefined,
      });
      toast.success(`Appointment ${labelForPastTense(target)}`);
      setPendingTarget(null);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not update appointment";
      toast.error(msg);
    }
  };

  const handleClick = (target: AppointmentStatus) => {
    const spec = ACTION_SPECS[target];
    if (spec.needsReason) {
      setPendingTarget(target);
      return;
    }
    void runTransition(target, null);
  };

  const dialogTarget = pendingTarget ? ACTION_SPECS[pendingTarget] : null;

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap gap-2",
          vertical && "flex-col",
          className,
        )}
      >
        {transitions.map((target) => {
          const spec = ACTION_SPECS[target];
          const Icon = spec.icon;
          const loading =
            mutation.isPending &&
            (pendingTarget === null
              ? mutation.variables?.status === target
              : pendingTarget === target);
          return (
            <Button
              key={target}
              type="button"
              size="sm"
              variant={spec.variant}
              onClick={() => handleClick(target)}
              disabled={mutation.isPending}
              className={cn(
                vertical && "w-full justify-start",
                spec.extraClass,
              )}
            >
              {loading ? (
                <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
              ) : (
                <Icon className="mr-1.5 size-4" aria-hidden />
              )}
              {spec.label}
            </Button>
          );
        })}
      </div>

      {dialogTarget && pendingTarget ? (
        <LifecycleReasonDialog
          open={pendingTarget !== null}
          onOpenChange={(open) => {
            if (!open) setPendingTarget(null);
          }}
          title={dialogTarget.dialogTitle}
          description={dialogTarget.dialogDescription}
          submitLabel={dialogTarget.submitLabel}
          submitVariant={
            dialogTarget.variant === "destructive" ? "destructive" : "default"
          }
          requireReason={dialogTarget.reasonRequired}
          pending={mutation.isPending}
          onConfirm={(reason) => void runTransition(pendingTarget, reason)}
        />
      ) : null}
    </>
  );
}

function labelForPastTense(status: AppointmentStatus): string {
  switch (status) {
    case "confirmed":
      return "confirmed";
    case "in_progress":
      return "started";
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "no_show":
      return "marked as no-show";
    default:
      return "updated";
  }
}
