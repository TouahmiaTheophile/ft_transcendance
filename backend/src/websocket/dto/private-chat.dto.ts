
import { MessageResponseDto } from "@shared/chat/chat.types";

export type JoinConversationPayload = {
  conversationId: number;
  limit: number;
};

export type LeaveConversationPayload = {
  conversationId: number;
};

export type SendMessagePayload = {
  conversationId: number;
  content: string;
};

export type ServerMessageEvent          = MessageResponseDto;