import { Injectable } from '@nestjs/common';
import { FriendshipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiErrors } from '../common/errors/api-exceptions.helper';
import { USER_PUBLIC_SELECT } from '../users/constants/user-selects';
import { FriendshipPolicy } from './policies/friendship.policy';
import { toFriendshipResponse, toFriendResponse } from './mappers/friendship.mapper';
import { FriendshipErrors } from './errors/friendship.errors';
import { FriendshipResponseDto, FriendResponseDto } from '@shared/friendship/friendship-response.dto';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
    private friendshipPolicy: FriendshipPolicy,
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
    });

    return toFriendshipResponse(friendship);
  }

  async accept(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');

    this.friendshipPolicy.assertAccept(friendship, userId);

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED },
    });

    return toFriendshipResponse(updated);
  }

  async reject(friendshipId: number, userId: number): Promise<FriendshipResponseDto> {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound('Friendship not found');

    this.friendshipPolicy.assertReject(friendship, userId);

    const updated = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.REJECTED },
    });

    return toFriendshipResponse(updated);
  }

  async listFriends(userId: number): Promise<FriendResponseDto[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: USER_PUBLIC_SELECT },
        addressee: { select: USER_PUBLIC_SELECT },
      },
    });

    return friendships.map(f => toFriendResponse(f, userId));
  }

  async listPending(userId: number): Promise<FriendshipResponseDto[]> {
    const friendships = await this.prisma.friendship.findMany({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
    });

    return friendships.map(toFriendshipResponse);
  }
}