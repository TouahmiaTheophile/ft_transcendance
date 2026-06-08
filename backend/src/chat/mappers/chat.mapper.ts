import { ConversationResponseDto, MessageResponseDto } from '@shared/chat/chat.types';
import { USER_PUBLIC_SELECT } from '../../users/constants/user-selects';
import { toUserResponse } from 'src/users/mappers/user.mapper';

export function toConversationResponse(
  conversation: any,
  currentUserId: number,
): ConversationResponseDto {
  const { requester, addressee } = conversation.friendship;
  const friend = requester.id === currentUserId ? addressee : requester;

  return {
    id: conversation.id,
    friend: toUserResponse(friend),
    createdAt: conversation.createdAt,
  };
}

export function toMessageResponse(message: any): MessageResponseDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: toUserResponse(message.sender),
    content: message.content,
    sentAt: message.sentAt,
  };
}

// Prisma include fragments reused across service and gateway
export const CONVERSATION_INCLUDE = {
  friendship: {
    include: {
      requester: { select: USER_PUBLIC_SELECT },
      addressee: { select: USER_PUBLIC_SELECT },
    },
  },
};

export const MESSAGE_INCLUDE = {
  sender: { select: USER_PUBLIC_SELECT },
};