import { queryOptions } from "@tanstack/react-query";

import { apiFetch } from "@/shared/api";

import type { AuditLogEntry } from "../model/types";

interface AuditLogEntryDto {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  payload: string;
  created_at: string;
}

interface ListResponse {
  entries: AuditLogEntryDto[];
}

function toEntry(dto: AuditLogEntryDto): AuditLogEntry {
  return {
    id: dto.id,
    actorId: dto.actor_id,
    action: dto.action,
    targetType: dto.target_type,
    targetId: dto.target_id,
    payload: dto.payload,
    createdAt: dto.created_at,
  };
}

export interface AuditLogFilter {
  limit?: number;
  action?: string;
  actorId?: string;
}

export const auditLogKeys = {
  all: () => ["audit-log"] as const,
  list: (filter: AuditLogFilter) =>
    [
      ...auditLogKeys.all(),
      "list",
      filter.limit ?? 100,
      filter.action ?? "",
      filter.actorId ?? "",
    ] as const,
};

export async function fetchAuditLogs(
  filter: AuditLogFilter = {},
): Promise<AuditLogEntry[]> {
  const res = await apiFetch<ListResponse>("/user/admin/audit", {
    query: {
      limit: filter.limit,
      action: filter.action || undefined,
      actor_id: filter.actorId || undefined,
    },
  });
  return (res.entries ?? []).map(toEntry);
}

export function auditLogsQuery(filter: AuditLogFilter = {}) {
  return queryOptions({
    queryKey: auditLogKeys.list(filter),
    queryFn: () => fetchAuditLogs(filter),
    staleTime: 15_000,
  });
}
