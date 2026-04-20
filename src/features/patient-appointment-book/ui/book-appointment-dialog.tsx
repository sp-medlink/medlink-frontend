"use client";

import { useState, type ReactNode } from "react";
import { CalendarPlus, Clock3, Loader2, MapPin, Video } from "lucide-react";
import { toast } from "sonner";

import { SlotPicker } from "@/features/appointment-slot-picker";
import { ApiError } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { useBookAppointmentMutation } from "../api/mutations";

interface BookAppointmentDialogProps {
  orgId: string;
  deptId: string;
  doctorDepartmentId: string;
  doctorName: string;
  departmentName?: string;
  /** Custom trigger — defaults to a "Book" button. */
  trigger?: ReactNode;
}

type Mode = "in_person" | "online";

function formatTimeHHMM(time: string): string {
  const m = time.match(/^(\d{2}):(\d{2})/);
  if (!m) return time;
  return `${m[1]}:${m[2]}`;
}

function formatDateForHeader(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Book-an-appointment dialog. Mounts a SlotPicker + a mode toggle and
 * posts to the `createMyAppointment` endpoint. Slots are keyed per
 * doctor-department; after a successful booking we invalidate the
 * whole `appointment` namespace so lists + available-slot windows refresh.
 */
export function BookAppointmentDialog({
  orgId,
  deptId,
  doctorDepartmentId,
  doctorName,
  departmentName,
  trigger,
}: BookAppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [mode, setMode] = useState<Mode>("in_person");
  const mutation = useBookAppointmentMutation();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset local state when the dialog closes so next open starts fresh.
      setSelected(null);
      setMode("in_person");
    }
    setOpen(next);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    try {
      await mutation.mutateAsync({
        doctorDepartmentId,
        date: selected.date,
        time: selected.time,
        isOnline: mode === "online",
      });
      toast.success("Appointment booked");
      handleOpenChange(false);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not book appointment";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" size="sm" variant="default">
            <CalendarPlus className="mr-1.5 size-4" aria-hidden />
            Book
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-160 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Book with {doctorName}</DialogTitle>
          <DialogDescription>
            {departmentName
              ? `Pick an available slot in ${departmentName}.`
              : "Pick an available slot."}
          </DialogDescription>
        </DialogHeader>

        {/* min-w-0 is the missing ingredient — without it the grid-item
            inside DialogContent grows to fit the SlotPicker's intrinsic
            content width, pushing the day strip past the dialog edge. */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="min-w-0">
            <SlotPicker
              orgId={orgId}
              deptId={deptId}
              doctorDepartmentId={doctorDepartmentId}
              selected={selected}
              onSelect={(s) => setSelected(s)}
              windowDays={7}
            />
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Visit type
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ModeButton
                active={mode === "in_person"}
                icon={<MapPin className="size-4" aria-hidden />}
                label="In person"
                hint="At the clinic"
                onClick={() => setMode("in_person")}
              />
              <ModeButton
                active={mode === "online"}
                icon={<Video className="size-4" aria-hidden />}
                label="Online"
                hint="Video call"
                onClick={() => setMode("online")}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            {selected ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-medium">
                  {formatDateForHeader(selected.date)}
                </span>
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <Clock3 className="size-3.5" aria-hidden />
                  {formatTimeHHMM(selected.time)}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {mode === "online" ? "Online" : "In person"}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Pick a day and time above to continue.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!selected || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : (
              <CalendarPlus className="mr-2 size-4" aria-hidden />
            )}
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModeButton({
  active,
  icon,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition",
        active
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-border bg-background hover:border-neutral-400",
      )}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0",
          active ? "text-emerald-700" : "text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-muted-foreground text-xs">{hint}</span>
      </span>
    </button>
  );
}
