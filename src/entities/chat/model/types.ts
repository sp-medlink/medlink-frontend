export interface Chat {
  id: string;
  userId: string;
  doctorDeptId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  textContent: string;
  attachments: MessageAttachment[];
  createdAt: string;
  updatedAt: string;
}

export type ChatWsEvent =
  | { type: "message.created"; payload: ChatMessage }
  | { type: "message.updated"; payload: ChatMessage }
  | { type: "message.deleted"; payload: { id: string } };
