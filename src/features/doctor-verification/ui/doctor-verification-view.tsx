"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { myDoctorProfileOptions } from "@/entities/doctor";

const LABEL: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  revoked: "Revoked",
};

export function DoctorVerificationView() {
  const q = useQuery(myDoctorProfileOptions());

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Verification</h1>
      {q.isPending ? (
        <Loader2 className="size-8 animate-spin" />
      ) : q.isError ? (
        <p className="text-destructive text-sm">Could not load profile.</p>
      ) : q.data ? (
        <div className="space-y-2 rounded-xl border p-4">
          <p className="text-sm">
            Status:{" "}
            <span className="font-medium">
              {LABEL[q.data.verificationStatus] ?? q.data.verificationStatus}
            </span>
          </p>
          {q.data.rejectionReason ? (
            <p className="text-muted-foreground text-sm">
              {q.data.rejectionReason}
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
