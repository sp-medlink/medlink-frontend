"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, NotebookPen, Save } from "lucide-react";
import { toast } from "sonner";

import type { AppointmentStatus } from "@/entities/appointment";
import { doctorEncounterQuery } from "@/entities/encounter";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import { useUpsertEncounterMutation } from "../api/mutations";

interface EncounterEditorProps {
  doctorDepartmentId: string;
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
}

const WRITABLE_STATUSES: AppointmentStatus[] = [
  "confirmed",
  "in_progress",
  "completed",
];

/**
 * Doctor-facing SOAP-ish editor scoped to one appointment. Backend
 * only accepts writes while the appointment is `in_progress` or
 * `completed`; we match that gate on the client so the form isn't
 * even editable for scheduled/cancelled rows.
 */
export function EncounterEditor({
  doctorDepartmentId,
  appointmentId,
  appointmentStatus,
}: EncounterEditorProps) {
  const query = useQuery(doctorEncounterQuery(doctorDepartmentId, appointmentId));
  const mutation = useUpsertEncounterMutation();

  const [note, setNote] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [followUp, setFollowUp] = useState("");

  // Seed local state when the query resolves — keep the editor
  // controlled so the user's in-flight edits survive re-renders.
  useEffect(() => {
    if (query.data) {
      setNote(query.data.note);
      setDiagnosis(query.data.diagnosis);
      setFollowUp(query.data.followUp);
    }
  }, [query.data]);

  const editable = WRITABLE_STATUSES.includes(appointmentStatus);

  const handleSave = async () => {
    if (!editable) return;
    try {
      await mutation.mutateAsync({
        doctorDepartmentId,
        appointmentId,
        note: note.trim(),
        diagnosis: diagnosis.trim(),
        followUp: followUp.trim(),
      });
      toast.success("Encounter saved");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not save encounter",
      );
    }
  };

  if (!editable) {
    return (
      <section className="flex items-center gap-2 text-sm text-muted-foreground">
        <NotebookPen className="size-4 shrink-0" aria-hidden />
        <span>Notes become editable once the visit is confirmed.</span>
      </section>
    );
  }

  const pending = mutation.isPending;

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <NotebookPen className="size-4 text-primary" aria-hidden />
          Encounter notes
          {query.isFetching ? (
            <Loader2
              className="ml-1 size-3.5 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : null}
        </h4>
      </header>

      <div className="grid gap-3">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor={`enc-note-${appointmentId}`}
            className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            Note
          </Label>
          <Textarea
            id={`enc-note-${appointmentId}`}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened during the visit"
            disabled={pending}
            className="bg-background"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor={`enc-diag-${appointmentId}`}
              className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              Diagnosis
            </Label>
            <Textarea
              id={`enc-diag-${appointmentId}`}
              rows={2}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Impression + ICD codes"
              disabled={pending}
              className="bg-background"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor={`enc-followup-${appointmentId}`}
              className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              Follow-up
            </Label>
            <Textarea
              id={`enc-followup-${appointmentId}`}
              rows={2}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Plan, next visit, home instructions"
              disabled={pending}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => void handleSave()}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="mr-2 size-4" aria-hidden />
          )}
          Save encounter
        </Button>
      </div>
    </section>
  );
}
