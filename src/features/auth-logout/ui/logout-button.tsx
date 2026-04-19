"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useLogout } from "../model/use-logout";

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive" | "link";
  className?: string;
  label?: string;
}

export function LogoutButton({
  variant = "outline",
  className,
  label = "Log out",
}: LogoutButtonProps) {
  const logout = useLogout();
  return (
    <Button type="button" variant={variant} className={className} onClick={logout}>
      <LogOut className="mr-2 size-4" />
      {label}
    </Button>
  );
}
