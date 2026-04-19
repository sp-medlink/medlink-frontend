/**
 * Two independent flows:
 *
 * • Patient chat — only `GET /user/me/chats` (+ messages). We do not pull org/dept catalog here.
 * • Organizations page — `GET /organizations`. Full doctor list across departments: `fetchSiteWideDoctorDirectory` (if needed).
 *
 * Start a chat with a doctor: `POST /user/me/chats` with `doctor_department_id` (see resolveChatIdForDoctorDepartment).
 */

import { apiFetch, ApiError } from "@/shared/api";

import type {
  CreateChatBody,
  CreateChatResponse,
  DepartmentDto,
  DoctorDepartmentDto,
  GetManyChatsResponse,
  GetManyDepartmentsResponse,
  GetManyDoctorDepartmentsResponse,
  GetManyOrganizationsResponse,
  GetDepartmentResponse,
  GetOrganizationResponse,
} from "./dto";

export interface DoctorDirectoryResult {
  /** Convenience for queries; for a slot use organization_id / department_id from the chosen doctor. */
  organizationId: string;
  departmentId: string;
  doctors: DoctorDepartmentDto[];
}

function isOrgUsable(org: { is_active?: boolean }): boolean {
  return org.is_active !== false;
}

function isDeptUsable(dept: {
  is_active?: boolean;
  is_enabled?: boolean;
}): boolean {
  return dept.is_active !== false && dept.is_enabled !== false;
}

/**
 * All doctor assignments returned by the public catalog API (across active org × dept pairs).
 */
export async function fetchSiteWideDoctorDirectory(): Promise<DoctorDirectoryResult> {
  const merged: DoctorDepartmentDto[] = [];
  const seen = new Set<string>();

  const { organizations } = await fetchOrganizations();
  const orgs = (organizations ?? []).filter(isOrgUsable);

  for (const org of orgs) {
    const { departments } = await fetchDepartments(org.id);
    const depts = (departments ?? []).filter(isDeptUsable);

    for (const dept of depts) {
      try {
        const docs = await fetchDoctorDepartments(org.id, dept.id);
        const list = docs.doctor_departments ?? [];
        for (const d of list) {
          if (seen.has(d.doctor_department_id)) continue;
          seen.add(d.doctor_department_id);
          merged.push(d);
        }
      } catch {
        /* skip department */
      }
    }
  }

  if (merged.length === 0) {
    throw new Error("NO_DOCTORS");
  }

  merged.sort((a, b) => {
    const orgCmp = a.organization_name.localeCompare(b.organization_name);
    if (orgCmp !== 0) return orgCmp;
    const depCmp = a.department_name.localeCompare(b.department_name);
    if (depCmp !== 0) return depCmp;
    return `${a.last_name} ${a.first_name}`.localeCompare(
      `${b.last_name} ${b.first_name}`,
    );
  });

  const first = merged[0]!;
  return {
    organizationId: first.organization_id,
    departmentId: first.department_id,
    doctors: merged,
  };
}

export async function fetchOrganizations(): Promise<GetManyOrganizationsResponse> {
  const data = await apiFetch<GetManyOrganizationsResponse>("/organizations");
  return { organizations: data.organizations ?? [] };
}

export async function fetchOrganization(
  organizationId: string,
): Promise<GetOrganizationResponse> {
  return apiFetch<GetOrganizationResponse>(`/organizations/${organizationId}`);
}

export async function fetchDepartments(
  organizationId: string,
): Promise<GetManyDepartmentsResponse> {
  const data = await apiFetch<GetManyDepartmentsResponse>(
    `/organizations/${organizationId}/departments`,
  );
  return { departments: data.departments ?? [] };
}

export async function fetchDepartment(
  organizationId: string,
  departmentId: string,
): Promise<GetDepartmentResponse> {
  return apiFetch<GetDepartmentResponse>(
    `/organizations/${organizationId}/departments/${departmentId}`,
  );
}

export async function fetchDoctorDepartments(
  organizationId: string,
  departmentId: string,
): Promise<GetManyDoctorDepartmentsResponse> {
  const data = await apiFetch<GetManyDoctorDepartmentsResponse>(
    `/organizations/${organizationId}/departments/${departmentId}/doctors`,
  );
  return { doctor_departments: data.doctor_departments ?? [] };
}

export async function fetchMyChats(): Promise<GetManyChatsResponse> {
  const data = await apiFetch<GetManyChatsResponse>("/user/me/chats");
  return { chats: data.chats ?? [] };
}

export async function createChat(
  body: CreateChatBody,
): Promise<CreateChatResponse> {
  return apiFetch<CreateChatResponse>("/user/me/chats", {
    method: "POST",
    json: body,
  });
}

export async function resolveChatIdForDoctorDepartment(
  doctorDepartmentId: string,
): Promise<string> {
  const { chats } = await fetchMyChats();
  const existing = chats.find(
    (c) => c.doctor_department_id === doctorDepartmentId,
  );
  if (existing) return existing.id;

  try {
    const created = await createChat({
      doctor_department_id: doctorDepartmentId,
    });
    return created.chat_id;
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      const { chats: again } = await fetchMyChats();
      const found = again.find(
        (c) => c.doctor_department_id === doctorDepartmentId,
      );
      if (found) return found.id;
    }
    throw e;
  }
}

export type { DepartmentDto, DoctorDepartmentDto };
