import { FriendshipStatus } from './friendship-snapshot.type';
import { UserResponseDto } from '../users/user-response.dto';

export type FriendshipResponseDto = {
  id: number;
  requester: UserResponseDto;
  addressee: UserResponseDto;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type FriendResponseDto = {
  id: number;
  friend: UserResponseDto;
};