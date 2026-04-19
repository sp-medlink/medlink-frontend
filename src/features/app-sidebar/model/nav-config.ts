import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Calendar,
  CalendarClock,
  ClipboardList,
  FileText,
  Flag,
  FolderOpen,
  GitBranch,
  Hospital,
  LayoutDashboard,
  MessageSquare,
  Pill,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  UserRound,
  Video,
} from "lucide-react";

import type { AppRole } from "@/shared/config";
import { routes } from "@/shared/config";

/**
 * Sidebar surfaces match the three real `AppRole`s. Admin sub-personas
 * (org / dept) share the same `admin` surface — they're capabilities, not
 * roles, and the unified `/admin` area handles what each can actually do.
 */
export type SidebarArea = "patient" | "doctor" | "admin";

export type NavMatch = "exact" | "prefix";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** `exact` for area dashboards so they are not active on every sub-route */
  match?: NavMatch;
}

export interface NavOptions {
  /**
   * If true, an "Admin" entry is injected into the patient/doctor sidebars
   * so users who hold an admin capability (org-admin, dept-admin, …) without
   * the platform `admin` base role can still discover the admin area.
   */
  isAnyAdmin?: boolean;
}

export function getSidebarAreaFromPath(pathname: string): SidebarArea | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first === "patient") return "patient";
  if (first === "doctor") return "doctor";
  if (first === "admin") return "admin";
  return null;
}

/**
 * Fallback area when a path doesn't imply one (e.g. `/settings`). Uses the
 * user's base app role — settings belong with whatever the user primarily
 * does, not with their admin surface.
 */
export function resolveSidebarAreaFromAppRole(
  appRole: AppRole | null,
): SidebarArea | null {
  switch (appRole) {
    case "admin":
      return "admin";
    case "doctor":
      return "doctor";
    case "patient":
      return "patient";
    case null:
    default:
      return null;
  }
}

export function getNavItems(area: SidebarArea, opts: NavOptions = {}): NavItem[] {
  const adminLink: NavItem = {
    href: routes.admin.root,
    label: "Admin",
    icon: UserCog,
  };

  switch (area) {
    case "patient": {
      const items: NavItem[] = [
        {
          href: routes.patient.root,
          label: "Home",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          href: routes.patient.doctors,
          label: "Find doctors",
          icon: Search,
        },
        {
          href: routes.patient.appointments,
          label: "Appointments",
          icon: Calendar,
        },
        {
          href: routes.patient.consultations,
          label: "Video visits",
          icon: Video,
        },
        {
          href: routes.patient.chats,
          label: "Chats",
          icon: MessageSquare,
        },
        {
          href: routes.patient.records,
          label: "Medical records",
          icon: FileText,
        },
        {
          href: routes.patient.documents,
          label: "Prescriptions & files",
          icon: FolderOpen,
        },
        {
          href: routes.patient.notifications,
          label: "Notifications",
          icon: Bell,
        },
      ];
      if (opts.isAnyAdmin) items.push(adminLink);
      items.push({
        href: routes.settings,
        label: "Profile & settings",
        icon: Settings,
      });
      return items;
    }
    case "doctor": {
      const items: NavItem[] = [
        {
          href: routes.doctor.root,
          label: "Home",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          href: routes.doctor.verification,
          label: "Verification",
          icon: ShieldCheck,
        },
        {
          href: routes.doctor.schedule,
          label: "Schedule",
          icon: CalendarClock,
        },
        {
          href: routes.doctor.appointments,
          label: "Appointments",
          icon: Calendar,
        },
        {
          href: routes.doctor.consultations,
          label: "Video visits",
          icon: Video,
        },
        {
          href: routes.doctor.chats,
          label: "Chats",
          icon: MessageSquare,
        },
        {
          href: routes.doctor.patients,
          label: "Patients & records",
          icon: UserRound,
        },
        {
          href: routes.doctor.prescriptions,
          label: "Prescriptions & notes",
          icon: Pill,
        },
        {
          href: routes.doctor.departments,
          label: "Departments",
          icon: Hospital,
        },
      ];
      if (opts.isAnyAdmin) items.push(adminLink);
      items.push({
        href: routes.settings,
        label: "Profile & settings",
        icon: Settings,
      });
      return items;
    }
    case "admin":
      return [
        {
          href: routes.admin.root,
          label: "Overview",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          href: routes.admin.verifications,
          label: "Doctor verifications",
          icon: ClipboardList,
        },
        {
          href: routes.admin.organizations,
          label: "Organizations",
          icon: Building2,
        },
        {
          href: routes.admin.departments,
          label: "Departments",
          icon: GitBranch,
        },
        {
          href: routes.admin.auditLogs,
          label: "Audit logs",
          icon: ScrollText,
        },
        {
          href: routes.admin.moderation,
          label: "Moderation",
          icon: Flag,
        },
        {
          href: routes.settings,
          label: "Profile & settings",
          icon: Settings,
        },
      ];
    default:
      return [];
  }
}

export function isNavActive(
  pathname: string,
  href: string,
  match: NavMatch = "prefix",
): boolean {
  if (match === "exact") {
    return pathname === href || pathname === `${href}/`;
  }
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}
