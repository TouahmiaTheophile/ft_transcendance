import { ConversationResponseDto, MessageResponseDto } from '@shared/chat/chat.types';
import { USER_PUBLIC_SELECT } from '../../users/constants/user-selects';

function toUserDto(user: any) {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: `/uploads/avatars/${user.avatarFilename}`,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function toConversationResponse(
  conversation: any,
  currentUserId: number,
): ConversationResponseDto {
  const { requester, addressee } = conversation.friendship;
  const friend = requester.id === currentUserId ? addressee : requester;

  return {
    id: conversation.id,
    friend: toUserDto(friend),
    createdAt: conversation.createdAt,
  };
}

export function toMessageResponse(message: any): MessageResponseDto {
  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: toUserDto(message.sender),
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