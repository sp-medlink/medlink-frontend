"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Eye, Loader2, ScrollText, Search } from "lucide-react";

import { auditLogsQuery, type AuditLogEntry } from "@/entities/audit-log";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

const PAGE = 100;

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function prettyPayload(raw: string): string {
  if (!raw) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function shortId(id: string | null): string {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export function AdminAuditLog() {
  const [limit, setLimit] = useState(PAGE);
  const [action, setAction] = useState("");
  const [actorId, setActorId] = useState("");
  const [selected, setSelected] = useState<AuditLogEntry | null>(null);

  const query = useQuery(
    auditLogsQuery({
      limit,
      action: action.trim() || undefined,
      actorId: actorId.trim() || undefined,
    }),
  );
  const rows = query.data ?? [];
  const reachedEnd = rows.length < limit;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="size-5 text-primary" aria-hidden />
            Audit log
          </CardTitle>
          <CardDescription>
            Every privileged action performed on the platform. Newest first.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <Input
                className="pl-9"
                placeholder="Filter by action (e.g. appointment.cancel)"
                value={action}
                onChange={(e) => {
                  setLimit(PAGE);
                  setAction(e.target.value);
                }}
              />
            </div>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <Input
                className="pl-9"
                placeholder="Filter by actor user ID"
                value={actorId}
                onChange={(e) => {
                  setLimit(PAGE);
                  setActorId(e.target.value);
                }}
              />
            </div>
          </div>

          {query.isPending ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading audit log…
            </div>
          ) : query.isError ? (
            <p className="text-destructive text-sm">
              Could not load audit log.
            </p>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
              <ScrollText className="size-7 text-muted-foreground" aria-hidden />
              <p className="text-muted-foreground text-sm">
                No audit entries match these filters.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">When</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead className="hidden md:table-cell">Actor</TableHead>
                      <TableHead className="hidden md:table-cell">Target</TableHead>
                      <TableHead className="text-right">Payload</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(entry.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">
                          {shortId(entry.actorId)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">
                          <span className="text-muted-foreground">{entry.targetType}</span>{" "}
                          {shortId(entry.targetId)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setSelected(entry)}
                          >
                            <Eye className="mr-1 size-4" aria-hidden />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!reachedEnd ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setLimit((n) => n + PAGE)}
                    disabled={query.isFetching}
                  >
                    {query.isFetching ? (
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    ) : (
                      <ChevronDown className="mr-2 size-4" aria-hidden />
                    )}
                    Load more
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-base">
              {selected?.action}
            </DialogTitle>
            <DialogDescription>
              {selected ? formatDateTime(selected.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[80px_1fr] gap-1">
                <span className="text-muted-foreground">Actor</span>
                <span className="font-mono text-xs">
                  {selected.actorId ?? "—"}
                </span>
                <span className="text-muted-foreground">Target</span>
                <span className="font-mono text-xs">
                  {selected.targetType} {selected.targetId ?? "—"}
                </span>
                <span className="text-muted-foreground">Entry</span>
                <span className="font-mono text-xs">{selected.id}</span>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Payload
                </p>
                <pre className="max-h-[50vh] overflow-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed">
                  {prettyPayload(selected.payload) || "—"}
                </pre>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
