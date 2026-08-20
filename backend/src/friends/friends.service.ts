import { Injectable } from '@nestjs/common';
import { FriendshipStatus, Prisma } from '@prisma/client';
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

      const { count } = await tx.friendship.updateMany({
        where: { id: friendshipId, status: FriendshipStatus.PENDING },
        data: { status: FriendshipStatus.ACCEPTED },
      });

      if (count === 0) {
        throw ApiErrors.conflict('Friendship was modified concurrently');
      }

      await tx.conversation.create({
        data: { friendshipId },
      });

      return tx.friendship.findUniqueOrThrow({
        where: { id: friendshipId },
        include: {
          requester: { select: USER_PUBLIC_SELECT },
          addressee: { select: USER_PUBLIC_SELECT },
        },
      });
    });

    return toFriendshipResponse(result);
  }

  async reject(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');
    this.friendshipPolicy.assertReject(friendship, userId);

    try {
      const deleted = await this.prisma.friendship.delete({
        where: { id: friendshipId, status: friendship.status },
        include: FRIENDSHIP_USERS_INCLUDE,
      });
      return toFriendshipResponse(deleted);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw ApiErrors.conflict('Friendship was modified concurrently');
      }
      throw err;
    }
  }

  async remove(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');
    this.friendshipPolicy.assertRemove(friendship, userId);

    try {
      const deleted = await this.prisma.friendship.delete({
        where: { id: friendshipId, status: friendship.status },
        include: FRIENDSHIP_USERS_INCLUDE,
      });
      return toFriendshipResponse(deleted);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw ApiErrors.conflict('Friendship was modified concurrently');
      }
      throw err;
    }
  }

  async block(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw ApiErrors.forbidden();
    }
    this.friendshipPolicy.assertBlock(friendship);

    const { count } = await this.prisma.friendship.updateMany({
      where: { id: friendshipId, status: friendship.status },
      data: { status: FriendshipStatus.BLOCKED },
    });

    if (count === 0) {
      throw ApiErrors.conflict('Friendship was modified concurrently');
    }

    const updated = await this.prisma.friendship.findUniqueOrThrow({
      where: { id: friendshipId },
      include: FRIENDSHIP_USERS_INCLUDE,
    });

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