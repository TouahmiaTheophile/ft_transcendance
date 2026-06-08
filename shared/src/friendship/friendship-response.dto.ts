import { FriendshipStatus } from './friendship-snapshot.type';
import { UserResponseDto } from '../users/user-response.dto';

// Réponse pour sendRequest / accept / reject — état brut de la relation
export type FriendshipResponseDto = {
  id: number;
  requester: UserResponseDto;
  addressee: UserResponseDto;
  status: FriendshipStatus;
  createdAt: Date;
  updatedAt: Date;
};

// Réponse pour listFriends — relation acceptée avec les infos publiques de l'ami
export type FriendResponseDto = {
  id: number;         // id de la Friendship
  friend: UserResponseDto;
};