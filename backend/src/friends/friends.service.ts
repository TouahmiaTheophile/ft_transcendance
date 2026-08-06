import { Injectable } from '@nestjs/common';
import { FriendshipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiErrors } from '../common/errors/api-exceptions.helper';
import { USER_PUBLIC_SELECT } from '../users/constants/user-selects';
import { FriendshipPolicy } from './policies/friendship.policy';
import { toFriendshipResponse, toFriendResponse } from './mappers/friendship.mapper';
import { FriendshipResponseDto, FriendResponseDto } from '@shared/friendship/friendship-response.dto';
import { ChatService } from '../chat/chat.service';
import { FRIENDSHIP_USERS_INCLUDE } from './constants/friendship.users-selects';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private friendshipPolicy: FriendshipPolicy,
    private chatService: ChatService,
  ) {}

  async sendRequest(requesterId: number, addresseeId: number): Promise<FriendshipResponseDto> {
    this.friendshipPolicy.assertSendRequest(requesterId, addresseeId);

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    this.friendshipPolicy.assertCreateAllowed(existing);

    const friendship = await this.prisma.friendship.create({
      data: { requesterId, addresseeId, status: FriendshipStatus.PENDING },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

    return toFriendshipResponse(friendship);
  }

  async accept(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const result = await this.prisma.$transaction(async (tx) => {
      const friendship = await tx.friendship.findUnique({
        where: { id: friendshipId },
      });

      if (!friendship) throw ApiErrors.notFound('Friendship not found');
      this.friendshipPolicy.assertAccept(friendship, userId);

      const updated = await tx.friendship.update({
        where: { id: friendshipId },
        data: { status: FriendshipStatus.ACCEPTED },
        include: {
          requester: { select: USER_PUBLIC_SELECT },
          addressee: { select: USER_PUBLIC_SELECT },
        },
      });

      await tx.conversation.create({
        data: { friendshipId },
      });

      return updated;
    });

    return toFriendshipResponse(result);
  }

  async reject(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');

    this.friendshipPolicy.assertReject(friendship, userId);

    const deleted = await this.prisma.friendship.delete({
      where: { id: friendshipId },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

    return toFriendshipResponse(deleted);
  }

  async remove(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');

    this.friendshipPolicy.assertRemove(friendship, userId);

    // No explicit conversation cleanup here (unlike block): Conversation has
    // onDelete: Cascade on friendshipId, so the conversation and its messages
    // go away with the row.
    const deleted = await this.prisma.friendship.delete({
      where: { id: friendshipId },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

    return toFriendshipResponse(deleted);
  }

  async block(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');

    // Either participant can block
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw ApiErrors.forbidden();
    }

    this.friendshipPolicy.assertBlock(friendship);

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.BLOCKED },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

    // Delete conversation — cascade removes messages
    await this.chatService.deleteConversationByFriendship(friendshipId);

    return toFriendshipResponse(updated);
  }

  async listFriends(userId: number): Promise<FriendResponseDto[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

    return friendships.map(f => toFriendResponse(f, userId));
  }

  async listPending(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

    return friendships.map(toFriendshipResponse);
  }
}