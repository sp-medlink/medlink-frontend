"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Pill, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import type { AppointmentStatus } from "@/entities/appointment";
import {
  doctorPrescriptionsQuery,
  type Prescription,
} from "@/entities/prescription";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

import {
  useCreatePrescriptionMutation,
  useDeletePrescriptionMutation,
} from "../api/mutations";

interface PrescriptionPanelProps {
  doctorDepartmentId: string;
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
  /** Display-only — shown in the panel header so the doctor sees who they prescribe for. */
  patientName?: string;
}

const WRITABLE_STATUSES: AppointmentStatus[] = [
  "confirmed",
  "in_progress",
  "completed",
];

const EMPTY_FORM = {
  drugName: "",
  dose: "",
  frequency: "",
  durationDays: "",
  notes: "",
};

/**
 * Issue + list + delete prescriptions for a single appointment.
 * Mirrors the backend's `writableStatuses` gate — the "add" form
 * only renders when the visit is in progress or completed.
 */
export function PrescriptionPanel({
  doctorDepartmentId,
  appointmentId,
  appointmentStatus,
  patientName,
}: PrescriptionPanelProps) {
  const list = useQuery(
    doctorPrescriptionsQuery(doctorDepartmentId, appointmentId),
  );
  const create = useCreatePrescriptionMutation();
  const remove = useDeletePrescriptionMutation();
  const editable = WRITABLE_STATUSES.includes(appointmentStatus);

  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  const canSubmit = editable && form.drugName.trim().length > 0;

  const handleAdd = async () => {
    if (!canSubmit) return;
    try {
      await create.mutateAsync({
        doctorDepartmentId,
        appointmentId,
        body: {
          drug_name: form.drugName.trim(),
          dose: form.dose.trim(),
          frequency: form.frequency.trim(),
          duration_days: form.durationDays.trim()
            ? Number(form.durationDays)
            : null,
          notes: form.notes.trim(),
        },
      });
      setForm(EMPTY_FORM);
      setAdding(false);
      toast.success("Prescription added");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not add prescription",
      );
    }
  };

  const handleDelete = async (p: Prescription) => {
    if (!window.confirm(`Delete "${p.drugName}"?`)) return;
    try {
      await remove.mutateAsync({
        doctorDepartmentId,
        appointmentId,
        prescriptionId: p.id,
      });
      toast.success("Prescription removed");
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not remove prescription",
      );
    }
  };

  const rows = list.data ?? [];
  const labelCls =
    "text-[11px] font-medium uppercase tracking-wide text-muted-foreground";

  return (
    <section className="space-y-3">
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
            <Pill className="size-4 text-primary" aria-hidden />
            Prescriptions
            {rows.length > 0 ? (
              <span className="text-muted-foreground text-xs font-normal">
                ({rows.length})
              </span>
            ) : null}
            {list.isFetching ? (
              <Loader2
                className="ml-1 size-3.5 animate-spin text-muted-foreground"
                aria-hidden
              />
            ) : null}
          </h4>
          {patientName ? (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              For {patientName}
            </p>
          ) : null}
        </div>
        {editable && !adding ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
          >
            <Plus className="mr-1 size-4" aria-hidden />
            Add
          </Button>
        ) : null}
      </header>

      {list.isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : list.isError ? (
        <p className="text-destructive text-sm">Could not load.</p>
      ) : rows.length === 0 && !adding ? (
        <p className="text-sm text-muted-foreground">
          No prescriptions on this visit yet.
        </p>
      ) : rows.length === 0 ? null : (
        <ul className="divide-y rounded-lg border bg-background/70">
          {rows.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-3 px-3 py-3 text-sm"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-baseline gap-2">
                  <Pill
                    className="size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <p className="text-base font-semibold leading-tight">
                    {p.drugName || "—"}
                  </p>
                  {p.dose ? (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">
                      {p.dose}
                    </span>
                  ) : null}
                </div>
                <dl className="ml-6 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs">
                  {p.frequency ? (
                    <>
                      <dt className="text-muted-foreground">Frequency</dt>
                      <dd>{p.frequency}</dd>
                    </>
                  ) : null}
                  {p.durationDays ? (
                    <>
                      <dt className="text-muted-foreground">Duration</dt>
                      <dd>{p.durationDays} days</dd>
                    </>
                  ) : null}
                  {p.notes ? (
                    <>
                      <dt className="text-muted-foreground">Notes</dt>
                      <dd className="italic">{p.notes}</dd>
                    </>
                  ) : null}
                </dl>
              </div>
              {editable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void handleDelete(p)}
                  disabled={
                    remove.isPending && remove.variables?.prescriptionId === p.id
                  }
                  aria-label="Delete prescription"
                >
                  {remove.isPending &&
                  remove.variables?.prescriptionId === p.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="size-4" aria-hidden />
                  )}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {editable && adding ? (
        <div className="rounded-lg border bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className={labelCls}>New prescription</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setAdding(false);
                setForm(EMPTY_FORM);
              }}
              aria-label="Cancel"
              disabled={create.isPending}
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`rx-drug-${appointmentId}`} className={labelCls}>
                Drug name
              </Label>
              <Input
                id={`rx-drug-${appointmentId}`}
                value={form.drugName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, drugName: e.target.value }))
                }
                placeholder="Amoxicillin"
                disabled={create.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`rx-dose-${appointmentId}`} className={labelCls}>
                Dose
              </Label>
              <Input
                id={`rx-dose-${appointmentId}`}
                value={form.dose}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dose: e.target.value }))
                }
                placeholder="500 mg"
                disabled={create.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`rx-freq-${appointmentId}`} className={labelCls}>
                Frequency
              </Label>
              <Input
                id={`rx-freq-${appointmentId}`}
                value={form.frequency}
                onChange={(e) =>
                  setForm((f) => ({ ...f, frequency: e.target.value }))
                }
                placeholder="Twice daily"
                disabled={create.isPending}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`rx-days-${appointmentId}`} className={labelCls}>
                Duration (days)
              </Label>
              <Input
                id={`rx-days-${appointmentId}`}
                type="number"
                min={1}
                max={365}
                value={form.durationDays}
                onChange={(e) =>
                  setForm((f) => ({ ...f, durationDays: e.target.value }))
                }
                placeholder="7"
                disabled={create.isPending}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <Label htmlFor={`rx-notes-${appointmentId}`} className={labelCls}>
              Notes
            </Label>
            <Textarea
              id={`rx-notes-${appointmentId}`}
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Take with food"
              disabled={create.isPending}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleAdd()}
              disabled={create.isPending || !canSubmit}
            >
              {create.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="mr-2 size-4" aria-hidden />
              )}
              Save prescription
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
