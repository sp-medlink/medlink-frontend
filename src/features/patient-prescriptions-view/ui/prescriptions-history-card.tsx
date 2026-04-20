"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Pill } from "lucide-react";

import { myPrescriptionsFlatQuery } from "@/entities/prescription";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const PAGE = 25;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Flat history of every prescription the patient has ever received,
 * newest first. We step the `limit` up in chunks of 25 — good enough
 * UX without a cursor API.
 */
export function PrescriptionsHistoryCard() {
  const [limit, setLimit] = useState(PAGE);
  const query = useQuery(myPrescriptionsFlatQuery(limit));
  const rows = query.data ?? [];
  const reachedEnd = rows.length < limit;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions history</CardTitle>
        <CardDescription>
          Everything your doctors have prescribed — newest first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">
            Could not load prescriptions.
          </p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No prescriptions yet — they appear here after a completed
            visit.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {rows.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start gap-3 rounded-lg border bg-background/70 px-3 py-2 text-sm"
                >
                  <Pill
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {p.drugName}
                      {p.dose ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {p.dose}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {[
                        p.frequency,
                        p.durationDays ? `${p.durationDays} days` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      Issued {formatDate(p.createdAt)}
                    </p>
                    {p.notes ? (
                      <p className="text-muted-foreground mt-0.5 text-xs italic">
                        {p.notes}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            {!reachedEnd ? (
              <div className="mt-3 flex justify-center">
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
  );
}
