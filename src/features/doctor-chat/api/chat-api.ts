import { fetchMyChats } from "@/entities/doctor-directory";
import { apiFetch } from "@/shared/api";

import type {
  GetManyChatMessagesResponse,
  GetManyDoctorChatsResponse,
  GetManyDoctorOwnDepartmentsResponse,
  SendChatMessageBody,
  SendChatMessageResponse,
  UnifiedInboxRow,
} from "./types";

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

export async function fetchDoctorOwnDepartments(): Promise<GetManyDoctorOwnDepartmentsResponse> {
  return apiFetch<GetManyDoctorOwnDepartmentsResponse>("/user/doctor/departments");
}

export async function fetchDoctorChatsForDepartment(
  doctorDepartmentId: string,
): Promise<GetManyDoctorChatsResponse> {
  return apiFetch<GetManyDoctorChatsResponse>(
    `/user/doctor/departments/${doctorDepartmentId}/chats`,
  );
}

export async function deleteChatAsPatient(chatId: string): Promise<void> {
  await apiFetch<unknown>(`/user/me/chats/${chatId}`, { method: "DELETE" });
}

export async function deleteChatAsDoctor(
  doctorDepartmentId: string,
  chatId: string,
): Promise<void> {
  await apiFetch<unknown>(
    `/user/doctor/departments/${doctorDepartmentId}/chats/${chatId}`,
    { method: "DELETE" },
  );
}

/** Patient: chat list from the backend only — no org/dept catalog. */
export async function fetchUnifiedInboxForPatient(): Promise<UnifiedInboxRow[]> {
  const { chats } = await fetchMyChats();
  return chats.map((c) => ({
    kind: "patient",
    chatId: c.id,
    doctorDepartmentId: c.doctor_department_id,
    peerDisplayName:
      `Dr. ${c.doctor_first_name} ${c.doctor_last_name}`.trim() || "Doctor",
    peerAvatarPath: c.doctor_avatar_path || null,
    lastMessageCreatedAt: c.last_message_created_at,
  }));
}

export async function fetchUnifiedInboxForDoctor(): Promise<UnifiedInboxRow[]> {
  const { doctors_departments: depts } = await fetchDoctorOwnDepartments();
  const active = depts.filter((d) => d.is_active && d.is_enabled);
  const chunks = await Promise.all(
    active.map(async (dep) => {
      const { chats } = await fetchDoctorChatsForDepartment(dep.id);
      return chats.map(
        (c): UnifiedInboxRow => ({
          kind: "doctor",
          chatId: c.id,
          doctorDepartmentId: c.doctor_department_id,
          peerDisplayName:
            `${c.patient_first_name} ${c.patient_last_name}`.trim() || "Patient",
          peerAvatarPath: c.patient_avatar_path || null,
          lastMessageCreatedAt: c.last_message_created_at,
        }),
      );
    }),
  );
  return chunks.flat().sort(
    (a, b) =>
      new Date(b.lastMessageCreatedAt).getTime() -
      new Date(a.lastMessageCreatedAt).getTime(),
  );
}
