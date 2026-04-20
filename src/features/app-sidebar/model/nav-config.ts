import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  GitBranch,
  Hospital,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
  Video,
} from "lucide-react";

import type { AdminCapabilities } from "@/entities/session";
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
   * Admin capabilities for the current user. Drives two things:
   *   1. Injection of the "Admin" shortcut into patient/doctor sidebars for
   *      users who hold admin capability via data ownership (org/dept-admin)
   *      rather than the platform `admin` base role.
   *   2. Which items appear in the admin-area sidebar (platform admin sees
   *      Organizations + Admins; dept-admin sees Departments; etc.).
   */
  caps?: AdminCapabilities;
  /**
   * Resolved base-role surface. Used to inject a "back" shortcut in the
   * admin sidebar for doctors / patients who arrived via the Admin link
   * — without it they'd have no path back to their primary area.
   */
  appRole?: AppRole | null;
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
  const caps = opts.caps;
  const isAnyAdmin = caps?.anyAdmin ?? false;
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
          href: routes.patient.organisations,
          label: "Organizations",
          icon: Hospital,
        },
        {
          href: routes.patient.appointments,
          label: "Appointments",
          icon: CalendarDays,
        },
        {
          href: routes.patient.consultations,
          label: "Video visits",
          icon: Video,
        },
        {
          href: routes.patient.records,
          label: "Medical record",
          icon: ScrollText,
        },
        {
          href: routes.patient.chats,
          label: "Chats",
          icon: MessageSquare,
        },
      ];
      if (isAnyAdmin) items.push(adminLink);
      // Plain patient-only users can apply to become a doctor — entry
      // point for the verification form. Disappears the moment they
      // pick up the `doctor` role (pending or approved), at which
      // point they see the doctor sidebar instead.
      if (opts.appRole === "patient") {
        items.push({
          href: routes.patient.becomeDoctor,
          label: "Become a doctor",
          icon: Stethoscope,
        });
      }
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
          href: routes.doctor.appointments,
          label: "Appointments",
          icon: CalendarDays,
        },
        {
          href: routes.doctor.patients,
          label: "Patients",
          icon: Users,
        },
        {
          href: routes.doctor.practice,
          label: "Practice",
          icon: Briefcase,
        },
        {
          href: routes.doctor.chats,
          label: "Chats",
          icon: MessageSquare,
        },
      ];
      if (isAnyAdmin) items.push(adminLink);
      items.push({
        href: routes.settings,
        label: "Profile & settings",
        icon: Settings,
      });
      return items;
    }
    case "admin": {
      // Before caps resolve we conservatively show only Overview + Settings to
      // avoid flashing items the user can't actually reach.
      const platform = caps?.platform ?? false;
      const anyOrg = caps?.anyOrg ?? false;
      const anyDept = caps?.anyDept ?? false;

      const items: NavItem[] = [];
      // Doctors / patients who enter the admin area via the "Admin" shortcut
      // need a way back to their primary surface. Platform admins don't —
      // admin *is* their primary surface.
      if (opts.appRole === "doctor") {
        items.push({
          href: routes.doctor.root,
          label: "Back to doctor area",
          icon: ArrowLeft,
        });
      } else if (opts.appRole === "patient") {
        items.push({
          href: routes.patient.root,
          label: "Back to patient area",
          icon: ArrowLeft,
        });
      }
      items.push({
        href: routes.admin.root,
        label: "Overview",
        icon: LayoutDashboard,
        match: "exact",
      });
      if (platform || anyOrg) {
        items.push({
          href: routes.admin.organizations,
          label: "Organizations",
          icon: Building2,
        });
      }
      // Dept-admins without org-admin context land directly on depts; platform
      // and org-admins reach depts by drilling through an organization, so we
      // don't give them a competing top-level link.
      if (anyDept && !platform && !anyOrg) {
        items.push({
          href: routes.admin.departments,
          label: "Departments",
          icon: GitBranch,
        });
      }
      if (platform) {
        items.push(
          {
            href: routes.admin.verifications,
            label: "Doctor verifications",
            icon: ShieldCheck,
          },
          {
            href: routes.admin.users,
            label: "Users",
            icon: Users,
          },
          {
            href: routes.admin.admins,
            label: "Platform admins",
            icon: UserCog,
          },
          {
            href: routes.admin.audit,
            label: "Audit log",
            icon: ScrollText,
          },
        );
      }
      items.push({
        href: routes.settings,
        label: "Profile & settings",
        icon: Settings,
      });
      return items;
    }
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
