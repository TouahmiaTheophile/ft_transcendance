export type FriendResponseDto = {
  id: number;
  friend: {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
  };
};