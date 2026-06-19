
// ─── WebSocket payloads (client → server) ─────────────────────────────────────

import { MessageResponseDto } from "@shared/chat/chat.types";

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