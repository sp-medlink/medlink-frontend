"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, Clock, Loader2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { myDoctorProfileOptions } from "@/entities/doctor";
import type { Doctor, VerificationStatus } from "@/entities/doctor";
import { ApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/shared/lib/utils";

import { useSubmitDoctorVerificationMutation } from "../api/mutations";

const LABEL: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  revoked: "Revoked",
};

// Statuses where the plain user has no action to take — admin needs
// to act, or they're already approved. Anything else (missing row,
// rejected, revoked) should surface the submission form.
const LOCKED_STATUSES: VerificationStatus[] = ["pending", "approved"];

interface DoctorVerificationViewProps {
  embedded?: boolean;
}

export function DoctorVerificationView({
  embedded = false,
}: DoctorVerificationViewProps) {
  const q = useQuery({
    ...myDoctorProfileOptions(),
    // 404 is the happy path for a user who hasn't applied yet — don't
    // retry and don't bark.
    retry: false,
  });
  const showHeader = !embedded;

  const doctor = q.data ?? null;
  const status = doctor?.verificationStatus;
  const isLocked = status !== undefined && LOCKED_STATUSES.includes(status);

  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-4",
        embedded ? "max-w-none p-4 sm:p-5" : "min-h-screen max-w-2xl p-6",
      )}
    >
      {showHeader ? (
        <h1 className="text-2xl font-semibold tracking-tight">Verification</h1>
      ) : null}

      {q.isPending ? (
        <Loader2 className="size-8 animate-spin" />
      ) : (
        <>
          {doctor ? (
            <StatusCard doctor={doctor} embedded={embedded} />
          ) : null}
          {!isLocked ? (
            <SubmissionForm resubmit={Boolean(doctor)} initial={doctor} />
          ) : null}
        </>
      )}
    </main>
  );
}

function StatusCard({
  doctor,
  embedded,
}: {
  doctor: Doctor;
  embedded: boolean;
}) {
  const { verificationStatus: status, rejectionReason } = doctor;
  const palette =
    status === "approved"
      ? "border-emerald-500/40 bg-emerald-50 text-emerald-900"
      : status === "pending"
        ? "border-amber-400/60 bg-amber-50 text-amber-900"
        : "border-destructive/30 bg-destructive/5 text-destructive";
  const Icon =
    status === "approved"
      ? BadgeCheck
      : status === "pending"
        ? Clock
        : AlertTriangle;

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border p-4",
        palette,
        embedded && "bg-card/60",
      )}
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4" aria-hidden />
        {LABEL[status] ?? status}
      </p>
      {rejectionReason ? (
        <p className="text-muted-foreground text-sm">{rejectionReason}</p>
      ) : null}
    </div>
  );
}

function SubmissionForm({
  resubmit,
  initial,
}: {
  resubmit: boolean;
  initial: Doctor | null;
}) {
  const [education, setEducation] = useState(initial?.education ?? "");
  const [experience, setExperience] = useState(initial?.experience ?? "");
  const [licenseNumber, setLicenseNumber] = useState(
    initial?.licenseNumber ?? "",
  );
  const [licenseCountry, setLicenseCountry] = useState(
    initial?.licenseCountry ?? "KZ",
  );
  const [licenseIssuedAt, setLicenseIssuedAt] = useState(
    initial?.licenseIssuedAt ?? "",
  );
  const [licenseExpiresAt, setLicenseExpiresAt] = useState(
    initial?.licenseExpiresAt ?? "",
  );

  const mutation = useSubmitDoctorVerificationMutation();
  const canSubmit =
    licenseNumber.trim().length > 0 && licenseCountry.trim().length > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error("License number and country are required");
      return;
    }
    try {
      await mutation.mutateAsync({
        education: education.trim(),
        experience: experience.trim(),
        license_number: licenseNumber.trim(),
        license_country: licenseCountry.trim(),
        license_issued_at: licenseIssuedAt,
        license_expires_at: licenseExpiresAt,
      });
      toast.success(
        resubmit
          ? "Resubmitted — an admin will review shortly"
          : "Submitted — an admin will review shortly",
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? (err.reason ?? err.message)
          : "Could not submit",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border p-4">
      <header>
        <h2 className="text-base font-semibold">
          {resubmit
            ? "Resubmit your application"
            : "Apply to practice on Medlink"}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          We need your license details to verify you. A platform admin
          reviews every submission before your profile goes live.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          id="lic-number"
          label="License number"
          required
          value={licenseNumber}
          onChange={setLicenseNumber}
          placeholder="KZ-MD-100123"
          disabled={mutation.isPending}
        />
        <Field
          id="lic-country"
          label="License country"
          required
          value={licenseCountry}
          onChange={setLicenseCountry}
          placeholder="KZ"
          disabled={mutation.isPending}
        />
        <Field
          id="lic-issued"
          label="Issued date"
          type="date"
          value={licenseIssuedAt}
          onChange={setLicenseIssuedAt}
          disabled={mutation.isPending}
        />
        <Field
          id="lic-expires"
          label="Expires date"
          type="date"
          value={licenseExpiresAt}
          onChange={setLicenseExpiresAt}
          disabled={mutation.isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edu">Education</Label>
        <Textarea
          id="edu"
          rows={2}
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          placeholder="MD, Kazakh National Medical University (2010)."
          disabled={mutation.isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="exp">Experience</Label>
        <Textarea
          id="exp"
          rows={3}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="10 years general cardiology; 200+ echocardiograms."
          disabled={mutation.isPending}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending || !canSubmit}>
          {mutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="mr-2 size-4" aria-hidden />
          )}
          {resubmit ? "Resubmit" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
