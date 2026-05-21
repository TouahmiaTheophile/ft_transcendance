import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { ApiErrors }
  from '../common/errors/api-exceptions.helper';

import { USER_PUBLIC_SELECT } from '../users/constants/user-selects';
import { toFriendResponse } from './mappers/friend.mapper';
import { FriendshipErrors } from './errors/friendship.errors';

@Injectable()
export class FriendsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async sendRequest(requesterId: number, addresseeId: number) {
    if (requesterId === addresseeId) {
      throw FriendshipErrors.selfRequest();
    }

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      throw FriendshipErrors.alreadyExists(existing);
    }

    return this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING',
      },
    });
  }

  async accept(friendshipId: number, userId: number) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) throw ApiErrors.notFound();

    if (friendship.addresseeId !== userId) {
      throw FriendshipErrors.forbidden(friendship);
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });
  }

	async listFriends(userId: number) {
	const friendships = await this.prisma.friendship.findMany({
		where: {
		status: 'ACCEPTED',
		OR: [
			{ requesterId: userId },
			{ addresseeId: userId },
		],
		},
		include: {
		requester: { select: USER_PUBLIC_SELECT },
		addressee: { select: USER_PUBLIC_SELECT },
		},
	});

	return friendships.map(f =>
		toFriendResponse(f, userId),
	);
	}
}