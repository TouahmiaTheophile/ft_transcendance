export type FriendshipSnapshot = {
  id: number;
  requesterId: number;
  addresseeId: number;
  status: string;
  createdAt?: Date;
};