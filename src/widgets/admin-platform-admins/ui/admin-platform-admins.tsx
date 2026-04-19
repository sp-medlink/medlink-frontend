"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, UserCog } from "lucide-react";

import { platformAdminsQuery } from "@/entities/platform-admin";
import { useCurrentUser } from "@/entities/session";
import { PlatformAdminAddForm } from "@/features/admin-platform-admin-add";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";

function initialsOf(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "?";
}

/**
 * Full `/admin/admins` surface. Per V3, platform admins can grant the role
 * to other users. Removal is intentionally not exposed here; it's available
 * on the backend if the product rule is relaxed later.
 */
export function AdminPlatformAdmins() {
  const query = useQuery(platformAdminsQuery());
  const me = useCurrentUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform admins</CardTitle>
        <CardDescription>
          Users who hold the <span className="font-mono">admin</span> base
          role. They can manage other platform admins, verify doctors, and
          moderate the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <PlatformAdminAddForm />

        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading admins…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">Could not load admins.</p>
        ) : query.data && query.data.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    User ID
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((admin) => {
                  const isSelf = me?.id === admin.userId;
                  const displayName =
                    `${admin.firstName} ${admin.lastName}`.trim() ||
                    admin.userId;
                  return (
                    <TableRow key={admin.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={admin.avatarPath || undefined}
                              alt=""
                            />
                            <AvatarFallback>
                              {initialsOf(admin.firstName, admin.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {displayName}
                              {isSelf ? (
                                <span className="text-muted-foreground ml-2 text-xs font-normal">
                                  (you)
                                </span>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs sm:table-cell">
                        {admin.userId}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <UserCog
              className="size-7 text-neutral-400 dark:text-neutral-600"
              aria-hidden
            />
            <p className="text-muted-foreground text-sm">
              No platform admins yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
