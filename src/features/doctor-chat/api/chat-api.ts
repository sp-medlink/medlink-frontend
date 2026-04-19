import { apiFetch, ApiError } from "@/shared/api";

import type {
  CreateChatBody,
  CreateChatResponse,
  DoctorDepartmentDto,
  GetManyChatMessagesResponse,
  GetManyChatsResponse,
  GetManyDepartmentsResponse,
  GetManyDoctorDepartmentsResponse,
  GetManyOrganizationsResponse,
  SendChatMessageBody,
  SendChatMessageResponse,
} from "./types";

export interface DoctorDirectoryResult {
  organizationId: string;
  departmentId: string;
  doctors: DoctorDepartmentDto[];
}

/**
 * Loads first active organization → first active department → doctors in that department.
 * Matches how the API scopes doctor listings.
 */
export async function fetchDoctorDirectory(): Promise<DoctorDirectoryResult> {
  const orgs = await fetchOrganizations();
  const org = orgs.organizations?.[0];
  if (!org) {
    throw new Error("NO_ORGANIZATIONS");
  }
  const depts = await fetchDepartments(org.id);
  const dept = depts.departments?.[0];
  if (!dept) {
    throw new Error("NO_DEPARTMENTS");
  }
  const docs = await fetchDoctorDepartments(org.id, dept.id);
  const list = docs.doctor_departments ?? [];
  const doctors = list.filter((d) => d.is_active && d.is_enabled);
  return {
    organizationId: org.id,
    departmentId: dept.id,
    doctors,
  };
}

export async function fetchOrganizations(): Promise<GetManyOrganizationsResponse> {
  return apiFetch<GetManyOrganizationsResponse>("/organizations");
}

export async function fetchDepartments(
  organizationId: string,
): Promise<GetManyDepartmentsResponse> {
  return apiFetch<GetManyDepartmentsResponse>(
    `/organizations/${organizationId}/departments`,
  );
}

export async function fetchDoctorDepartments(
  organizationId: string,
  departmentId: string,
): Promise<GetManyDoctorDepartmentsResponse> {
  return apiFetch<GetManyDoctorDepartmentsResponse>(
    `/organizations/${organizationId}/departments/${departmentId}/doctors`,
  );
}

export async function fetchMyChats(): Promise<GetManyChatsResponse> {
  return apiFetch<GetManyChatsResponse>("/user/me/chats");
}

export async function createChat(
  body: CreateChatBody,
): Promise<CreateChatResponse> {
  return apiFetch<CreateChatResponse>("/user/me/chats", {
    method: "POST",
    json: body,
  });
}

/**
 * Resolves chat UUID for a doctor department: existing row or creates one.
 */
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

export async function fetchChatMessages(
  chatId: string,
): Promise<GetManyChatMessagesResponse> {
  return apiFetch<GetManyChatMessagesResponse>(
    `/user/me/chats/${chatId}/messages`,
  );
}

export async function sendChatMessage(
  chatId: string,
  body: SendChatMessageBody,
): Promise<SendChatMessageResponse> {
  return apiFetch<SendChatMessageResponse>(
    `/user/me/chats/${chatId}/messages`,
    {
      method: "POST",
      json: body,
    },
  );
}
