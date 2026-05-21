export function toFriendResponse(friendship, userId: number) {
  const friend =
    friendship.requesterId === userId
      ? friendship.addressee
      : friendship.requester;

  return {
    id: friendship.id,
    friend,
  };
}