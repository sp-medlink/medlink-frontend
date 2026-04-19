"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";

import {
  doctorVerificationsListQuery,
  type DoctorVerification,
  type VerificationStatus,
} from "@/entities/doctor-verification";
import {
  VerificationApproveButton,
  VerificationRejectDialog,
  VerificationRevokeDialog,
} from "@/features/admin-doctor-verification";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

type FilterValue = VerificationStatus | "all";

function initialsOf(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
}

function statusBadge(status: VerificationStatus) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Pending</Badge>;
    case "approved":
      return <Badge variant="default">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "revoked":
      return <Badge variant="destructive">Revoked</Badge>;
  }
}

function ActionsCell({ row }: { row: DoctorVerification }) {
  const displayName =
    `${row.firstName} ${row.lastName}`.trim() || row.doctorId;

  switch (row.verificationStatus) {
    case "pending":
      return (
        <div className="flex justify-end gap-2">
          <VerificationApproveButton
            doctorId={row.doctorId}
            displayName={displayName}
          />
          <VerificationRejectDialog
            doctorId={row.doctorId}
            displayName={displayName}
          />
        </div>
      );
    case "approved":
      return (
        <div className="flex justify-end">
          <VerificationRevokeDialog
            doctorId={row.doctorId}
            displayName={displayName}
          />
        </div>
      );
    case "rejected":
      // The doctor must resubmit; there's nothing for an admin to do
      // from the list row. Re-approving requires a new submission.
      return (
        <div className="flex justify-end">
          <span className="text-muted-foreground text-xs">
            Awaiting resubmission
          </span>
        </div>
      );
    case "revoked":
      return (
        <div className="flex justify-end">
          <span className="text-muted-foreground text-xs">Revoked</span>
        </div>
      );
  }
}

/**
 * Platform-admin doctor verification queue. Status filter is applied
 * server-side for accuracy (and to keep the URL-shareable semantics
 * when we eventually lift this into the route). "All" omits the query
 * param entirely.
 */
export function AdminDoctorVerifications() {
  const [status, setStatus] = useState<FilterValue>("pending");

  const query = useQuery(
    doctorVerificationsListQuery(status === "all" ? undefined : status),
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Doctor verifications</CardTitle>
          <CardDescription>
            Review identity and licensing submissions. Approve to let
            the doctor start receiving appointments; reject with a
            reason if something needs fixing.
          </CardDescription>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as FilterValue)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading verifications…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">
            Could not load verifications.
          </p>
        ) : query.data && query.data.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="hidden md:table-cell">
                    License
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((row) => {
                  const displayName =
                    `${row.firstName} ${row.lastName}`.trim() || row.doctorId;
                  return (
                    <TableRow key={row.doctorId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={row.avatarPath || undefined}
                              alt=""
                            />
                            <AvatarFallback>
                              {initialsOf(row.firstName, row.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {displayName}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Submitted{" "}
                              {new Date(row.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col text-xs">
                          <span className="font-mono">
                            {row.licenseNumber || "—"}
                          </span>
                          <span className="text-muted-foreground">
                            {row.licenseCountry || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {statusBadge(row.verificationStatus)}
                          {row.rejectionReason ? (
                            <span className="text-muted-foreground text-xs">
                              {row.rejectionReason}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <ActionsCell row={row} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <ShieldCheck
              className="size-7 text-neutral-400 dark:text-neutral-600"
              aria-hidden
            />
            <p className="text-muted-foreground text-sm">
              Nothing here — the queue is clear.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
