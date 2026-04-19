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
  Stethoscope,
  UserRound,
  Users,
  Video,
} from "lucide-react";

import type { AppRole } from "@/shared/config";
import { routes } from "@/shared/config";

export type SidebarArea =
  | "patient"
  | "doctor"
  | "admin"
  | "dept-admin"
  | "org-admin";

export type NavMatch = "exact" | "prefix";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** `exact` for area dashboards so they are not active on every sub-route */
  match?: NavMatch;
}

export function getSidebarAreaFromPath(pathname: string): SidebarArea | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (first === "patient") return "patient";
  if (first === "doctor") return "doctor";
  if (first === "admin") return "admin";
  if (first === "dept-admin") return "dept-admin";
  if (first === "org-admin") return "org-admin";
  return null;
}

/** Fallback sidebar when opening `/settings` directly (no prior route in session). */
export function resolveSettingsSidebarArea(appRole: AppRole | null): SidebarArea {
  if (appRole === "admin") return "admin";
  if (appRole === "doctor") return "doctor";
  return "patient";
}

export function getNavItems(area: SidebarArea): NavItem[] {
  switch (area) {
    case "patient":
      return [
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
        {
          href: routes.settings,
          label: "Profile & settings",
          icon: Settings,
        },
      ];
    case "doctor":
      return [
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
        {
          href: routes.settings,
          label: "Profile & settings",
          icon: Settings,
        },
      ];
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
    case "dept-admin":
      return [
        {
          href: routes.deptAdmin.root,
          label: "Overview",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          href: routes.deptAdmin.staff,
          label: "Staff",
          icon: Users,
        },
        {
          href: routes.deptAdmin.schedule,
          label: "Schedule",
          icon: Calendar,
        },
        {
          href: routes.settings,
          label: "Profile & settings",
          icon: Settings,
        },
      ];
    case "org-admin":
      return [
        {
          href: routes.orgAdmin.root,
          label: "Overview",
          icon: LayoutDashboard,
          match: "exact",
        },
        {
          href: routes.orgAdmin.organizations,
          label: "Organizations",
          icon: Building2,
        },
        {
          href: routes.orgAdmin.departments,
          label: "Departments",
          icon: GitBranch,
        },
        {
          href: routes.orgAdmin.doctors,
          label: "Doctors",
          icon: Stethoscope,
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
