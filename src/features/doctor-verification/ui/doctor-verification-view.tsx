"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { myDoctorProfileOptions } from "@/entities/doctor";
import { cn } from "@/shared/lib/utils";

const LABEL: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  revoked: "Revoked",
};

interface DoctorVerificationViewProps {
  embedded?: boolean;
}

export function DoctorVerificationView({ embedded = false }: DoctorVerificationViewProps) {
  const q = useQuery(myDoctorProfileOptions());
  const showHeader = !embedded;

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
      ) : q.isError ? (
        <p className="text-destructive text-sm">Could not load profile.</p>
      ) : q.data ? (
        <div className={cn("space-y-2 rounded-xl border p-4", embedded && "bg-card/60")}>
          <p className="text-sm">
            {embedded ? "Verification status: " : "Status: "}
            <span className="font-medium capitalize">
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
