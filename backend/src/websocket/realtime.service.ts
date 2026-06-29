import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { FriendsService } from 'src/friends/friends.service';

@Injectable()
export class RealtimeService {
  private server: Server;

  constructor(private friendService: FriendsService) {}

  setServer(server: Server) {
    this.server = server;
  }

  async notifyFriendsOnline(userId: number) {
    const friendships = await this.friendService.listFriends(userId);
    const friendIds = friendships.map(f => f.friend.id);
    for (const id of friendIds) {
      this.server?.to(`user:${id}`).emit('friend:status', {
        userId,
        status: 'online',
      });
    }
  }

  async notifyFriendsOffline(userId: number) {
    const friendships = await this.friendService.listFriends(userId);
    const friendIds = friendships.map(f => f.friend.id);
    for (const id of friendIds) {
      this.server?.to(`user:${id}`).emit('friend:status', {
        userId,
        status: 'offline',
      });
    }
  }
}