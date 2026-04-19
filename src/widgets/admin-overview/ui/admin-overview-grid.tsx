"use client";

import type { Route } from "next";
import {
  Building2,
  GitBranch,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { useAdminCapabilities } from "@/entities/session";
import { routes } from "@/shared/config";

import { AdminEntryCard } from "./admin-entry-card";

interface Entry {
  key: string;
  href: Route;
  icon: typeof Building2;
  title: string;
  description: string;
  hint?: string;
  visible: boolean;
}

/**
 * Renders the top-level entry cards on the admin overview. Each card is a
 * gate into a downstream slice; which ones appear depends on the user's
 * capabilities. Dept-admins don't get an "Organizations" card because they
 * don't have org-level context; platform / org-admins reach departments by
 * drilling *through* an organization, so they don't get a top-level
 * "Departments" card either.
 */
export function AdminOverviewGrid() {
  const caps = useAdminCapabilities();

  const entries: Entry[] = [
    {
      key: "organizations",
      href: routes.admin.organizations as Route,
      icon: Building2,
      title: "Organizations",
      description: caps.platform
        ? "Every organization on the platform. Provision new tenants and their initial admin."
        : "Organizations you administer. Edit metadata and manage departments.",
      visible: caps.platform || caps.anyOrg,
    },
    {
      key: "departments",
      href: routes.admin.departments as Route,
      icon: GitBranch,
      title: "Departments",
      description: "Departments you administer. Edit details and toggle active status.",
      hint: "Department admin",
      visible: caps.anyDept && !caps.platform && !caps.anyOrg,
    },
    {
      key: "verifications",
      href: routes.admin.verifications as Route,
      icon: ShieldCheck,
      title: "Doctor verifications",
      description: "Review license and identity submissions. Approve, reject, or revoke.",
      hint: "Platform admin only",
      visible: caps.platform,
    },
    {
      key: "users",
      href: routes.admin.users as Route,
      icon: Users,
      title: "Users",
      description: "Every registered user on the platform. Oversight and cleanup.",
      hint: "Platform admin only",
      visible: caps.platform,
    },
    {
      key: "admins",
      href: routes.admin.admins as Route,
      icon: UserCog,
      title: "Platform admins",
      description: "Grant or revoke the platform admin role.",
      hint: "Platform admin only",
      visible: caps.platform,
    },
  ];

  const visible = entries.filter((e) => e.visible);

  if (!caps.ready) {
    return (
      <p className="text-muted-foreground text-sm">Loading admin areas…</p>
    );
  }

  if (visible.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No admin areas available for your account.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((e) => (
        <AdminEntryCard
          key={e.key}
          href={e.href}
          icon={e.icon}
          title={e.title}
          description={e.description}
          hint={e.hint}
        />
      ))}
    </div>
  );
}
