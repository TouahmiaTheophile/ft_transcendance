import { UserResponseDto } from '../users/user-response.dto';

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
