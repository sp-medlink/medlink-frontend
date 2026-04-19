"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Users } from "lucide-react";

import { adminUsersQuery } from "@/entities/admin-user";
import { AdminUserDeleteButton } from "@/features/admin-user-delete";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
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

function roleVariant(
  role: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (role) {
    case "admin":
      return "default";
    case "doctor":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Platform-admin-only surface: every registered user on Medlink, with
 * their base roles visible. A plain substring filter is sufficient here
 * because the backend doesn't paginate yet — if the user count grows,
 * swap this for a server-side search endpoint.
 */
export function AdminUsers() {
  const query = useQuery(adminUsersQuery());
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return query.data ?? [];
    return (query.data ?? []).filter((u) => {
      const haystack = [
        u.firstName,
        u.lastName,
        u.email,
        u.phoneNumber,
        u.iin,
        u.id,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [filter, query.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Every registered account on the platform (excluding your own).
          Use sparingly — this is an operator oversight tool, not a
          customer-support console.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden
          />
          <Input
            className="pl-9"
            placeholder="Search by name, email, phone, IIN, or user ID…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Loading users…
          </div>
        ) : query.isError ? (
          <p className="text-destructive text-sm">Could not load users.</p>
        ) : filtered.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contact
                  </TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => {
                  const displayName =
                    `${user.firstName} ${user.lastName}`.trim() || user.id;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage
                              src={user.avatarPath || undefined}
                              alt=""
                            />
                            <AvatarFallback>
                              {initialsOf(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {displayName}
                            </span>
                            <span className="text-muted-foreground font-mono text-xs">
                              {user.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col text-xs">
                          <span>{user.email || "—"}</span>
                          <span className="text-muted-foreground">
                            {user.phoneNumber || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length === 0 ? (
                            <Badge variant="outline">patient</Badge>
                          ) : (
                            user.roles.map((role) => (
                              <Badge key={role} variant={roleVariant(role)}>
                                {role}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <AdminUserDeleteButton
                          userId={user.id}
                          displayName={displayName}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <Users
              className="size-7 text-neutral-400 dark:text-neutral-600"
              aria-hidden
            />
            <p className="text-muted-foreground text-sm">
              {filter ? "No users match your search." : "No users yet."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
