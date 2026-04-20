"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  CircleAlert,
  Hourglass,
  Loader2,
  RotateCcw,
  ShieldOff,
} from "lucide-react";

import {
  myDoctorVerificationQuery,
  type MyVerification,
  type VerificationStatus,
} from "@/entities/doctor-verification";
import { DoctorCredentialForm } from "@/features/doctor-credential-submit";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function StatusBadge({ status }: { status: VerificationStatus }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline">
          <Hourglass className="mr-1 size-3" aria-hidden />
          Pending review
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
          <BadgeCheck className="mr-1 size-3" aria-hidden />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive">
          <CircleAlert className="mr-1 size-3" aria-hidden />
          Rejected
        </Badge>
      );
    case "revoked":
      return (
        <Badge variant="destructive">
          <ShieldOff className="mr-1 size-3" aria-hidden />
          Revoked
        </Badge>
      );
  }
}

function StatusCopy({ status }: { status: VerificationStatus }) {
  switch (status) {
    case "pending":
      return (
        <>
          <AlertTitle>Under review</AlertTitle>
          <AlertDescription>
            A platform admin is verifying your license. You&apos;ll get
            access to scheduling and appointments as soon as it&apos;s
            approved — usually within 1–2 business days.
          </AlertDescription>
        </>
      );
    case "approved":
      return (
        <>
          <AlertTitle>You&apos;re verified</AlertTitle>
          <AlertDescription>
            Your profile is live. You can now join departments, publish
            availability, and accept patient appointments.
          </AlertDescription>
        </>
      );
    case "rejected":
      return (
        <>
          <AlertTitle>Submission rejected</AlertTitle>
          <AlertDescription>
            Review the reason below, then resubmit with the corrected
            details. Resubmitting clears the old record and sends a fresh
            submission to the admin queue.
          </AlertDescription>
        </>
      );
    case "revoked":
      return (
        <>
          <AlertTitle>Verification revoked</AlertTitle>
          <AlertDescription>
            Your approved status has been revoked by a platform admin.
            Read the reason below. You can submit fresh credentials to be
            reviewed again.
          </AlertDescription>
        </>
      );
  }
}

/** Rejected and revoked submissions are the only ones that can be cleared. */
function canResubmit(status: VerificationStatus): boolean {
  return status === "rejected" || status === "revoked";
}

function VerificationDetails({ data }: { data: MyVerification }) {
  const items: Array<{ label: string; value: string }> = [
    { label: "License number", value: data.licenseNumber || "—" },
    { label: "Issuing country", value: data.licenseCountry || "—" },
    { label: "Issued on", value: formatDate(data.licenseIssuedAt) },
    { label: "Expires on", value: formatDate(data.licenseExpiresAt) },
    { label: "Submitted", value: formatDate(data.submittedAt) },
  ];
  if (data.verifiedAt) {
    items.push({ label: "Reviewed", value: formatDate(data.verifiedAt) });
  }

  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col">
          <dt className="text-muted-foreground text-xs">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ResubmitSection({ data }: { data: MyVerification }) {
  const [showForm, setShowForm] = useState(false);

  if (!canResubmit(data.verificationStatus)) return null;

  // Blank form on purpose: if the admin rejected the old license data,
  // there's no point prefilling it — the doctor has to enter new or
  // corrected credentials. Backend overwrites the rejected row and
  // resets status to pending on a successful POST.
  if (showForm) {
    return <DoctorCredentialForm onSubmitted={() => setShowForm(false)} />;
  }

  return (
    <div className="flex justify-end">
      <Button type="button" onClick={() => setShowForm(true)}>
        <RotateCcw className="mr-2 size-4" aria-hidden />
        Submit new credentials
      </Button>
    </div>
  );
}

/**
 * Doctor-facing verification surface. Three render paths driven by the
 * `/user/doctor/verification` query:
 *
 *   - query errors → inline error (rare — 401/500 etc.)
 *   - `null`       → no profile yet → show submission form
 *   - value        → status card with details + rejection reason +
 *                    resubmit button for rejected/revoked rows
 */
export function DoctorVerificationStatus() {
  const query = useQuery(myDoctorVerificationQuery());

  if (query.isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading verification status…
        </CardContent>
      </Card>
    );
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load status</AlertTitle>
        <AlertDescription>
          {query.error instanceof Error ? query.error.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  if (query.data === null || query.data === undefined) {
    return <DoctorCredentialForm />;
  }

  const data = query.data;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Verification status</CardTitle>
            <CardDescription>
              Submitted {formatDate(data.submittedAt)}
            </CardDescription>
          </div>
          <StatusBadge status={data.verificationStatus} />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Alert>
            <StatusCopy status={data.verificationStatus} />
          </Alert>

          {data.rejectionReason ? (
            <div className="border-destructive/40 bg-destructive/5 flex flex-col gap-1 rounded-md border px-4 py-3 text-sm">
              <span className="text-muted-foreground text-xs font-medium">
                Admin note
              </span>
              <p>{data.rejectionReason}</p>
            </div>
          ) : null}

          <VerificationDetails data={data} />
        </CardContent>
      </Card>

      <ResubmitSection data={data} />
    </div>
  );
}
