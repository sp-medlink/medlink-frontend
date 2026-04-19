"use client";

import type { Route } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";

import type { Organization } from "@/entities/organization";
import { OrganizationDeleteButton } from "@/features/admin-organization-crud";
import { routes } from "@/shared/config";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

interface AdminOrganizationsTableProps {
  orgs: Organization[];
}

export function AdminOrganizationsTable({
  orgs,
}: AdminOrganizationsTableProps) {
  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
        <Building2
          className="size-8 text-neutral-400 dark:text-neutral-600"
          aria-hidden
        />
        <p className="text-muted-foreground text-sm">
          No organizations yet. Create one to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>UIN</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orgs.map((org) => {
            const href = `${routes.admin.organizations}/${org.id}` as Route;
            return (
              <TableRow key={org.id}>
                <TableCell>
                  <Link
                    href={href}
                    className="font-medium hover:underline"
                  >
                    {org.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{org.uin}</TableCell>
                <TableCell>
                  <Badge variant={org.isActive ? "default" : "secondary"}>
                    {org.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {org.phoneNumber}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={href}>Open</Link>
                    </Button>
                    <OrganizationDeleteButton
                      orgId={org.id}
                      orgName={org.name}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
