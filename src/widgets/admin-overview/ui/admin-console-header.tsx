"use client";

import { useAdminCapabilities, useCurrentUser } from "@/entities/session";
import { cn } from "@/shared/lib/utils";

/**
 * Header for the `/admin` landing page. Shows the current user's name and
 * a line of chips describing which admin flavours they hold — a user can
 * legitimately hold more than one (e.g. org-admin + dept-admin), so we
 * don't collapse to a single primary label.
 */
export function AdminConsoleHeader() {
  const user = useCurrentUser();
  const caps = useAdminCapabilities();

  const personas = [
    caps.platform ? "Platform admin" : null,
    caps.anyOrg && !caps.platform ? "Organization admin" : null,
    caps.anyDept && !caps.platform ? "Department admin" : null,
  ].filter((v): v is string => v !== null);

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <header className="flex flex-col gap-3 border-b border-neutral-200 pb-6 dark:border-neutral-800">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wider">
          Admin console
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {displayName ? `Welcome, ${displayName}` : "Welcome"}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {personas.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            Loading capabilities…
          </span>
        ) : (
          personas.map((label) => (
            <span
              key={label}
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                "border-emerald-200 bg-emerald-50 text-emerald-900",
                "dark:border-emerald-900/50 dark:bg-emerald-950 dark:text-emerald-200",
              )}
            >
              {label}
            </span>
          ))
        )}
      </div>
    </header>
  );
}
