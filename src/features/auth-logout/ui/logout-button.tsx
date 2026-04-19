"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useLogout } from "../model/use-logout";

const logoutStyles =
  "border-rose-300 bg-rose-50/80 text-rose-800 shadow-xs hover:bg-rose-100 hover:text-rose-900 dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70 dark:hover:text-rose-50";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  className?: string;
  label?: string;
  /** Icon only (e.g. collapsed sidebar); label is exposed to screen readers */
  iconOnly?: boolean;
}

export function LogoutButton({
  variant = "outline",
  className,
  label = "Log out",
  iconOnly = false,
}: LogoutButtonProps) {
  const logout = useLogout();
  if (iconOnly) {
    return (
      <Button
        type="button"
        variant={variant}
        size="icon"
        className={cn(logoutStyles, className)}
        onClick={logout}
        aria-label={label}
        title={label}
      >
        <LogOut className="size-4" />
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant={variant}
      className={cn(logoutStyles, className)}
      onClick={logout}
    >
      <LogOut className="mr-2 size-4" />
      {label}
    </Button>
  );
}
