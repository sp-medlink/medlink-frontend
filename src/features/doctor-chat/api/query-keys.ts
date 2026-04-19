export const doctorChatKeys = {
  all: () => ["doctor-chat"] as const,
  directory: () => [...doctorChatKeys.all(), "directory"] as const,
  orgs: () => [...doctorChatKeys.all(), "organizations"] as const,
  depts: (orgId: string) =>
    [...doctorChatKeys.all(), "departments", orgId] as const,
  doctors: (orgId: string, deptId: string) =>
    [...doctorChatKeys.all(), "doctors", orgId, deptId] as const,
  myChats: () => [...doctorChatKeys.all(), "my-chats"] as const,
  /** Merged patient/doctor inbox (role encoded in cache entry via queryFn). */
  inbox: (role: string) => [...doctorChatKeys.all(), "inbox", role] as const,
  resolvedChat: (doctorDeptId: string) =>
    [...doctorChatKeys.all(), "resolved-chat", doctorDeptId] as const,
  messages: (chatId: string) =>
    [...doctorChatKeys.all(), "messages", chatId] as const,
};
