import { UserResponseDto } from '../users/user-response.dto';

// ─── Response DTOs ────────────────────────────────────────────────────────────

export type ConversationResponseDto = {
  id: number;
  friend: UserResponseDto;
  createdAt: Date;
};

export type MessageResponseDto = {
  id: number;
  conversationId: number;
  sender: UserResponseDto;
  content: string;
  sentAt: Date;
};

// ─── WebSocket payloads (client → server) ─────────────────────────────────────

export type JoinConversationPayload = {
  conversationId: number;
  limit: number; // Number of recent messages to receive on join
};

export type LeaveConversationPayload = {
  conversationId: number;
};

export type SendMessagePayload = {
  conversationId: number;
  content: string;
};

// ─── WebSocket events (server → client) ───────────────────────────────────────

export type ServerMessageEvent          = MessageResponseDto;