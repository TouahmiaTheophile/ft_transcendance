export const USER_PUBLIC_SELECT = {
  id: true,
  username: true,
  avatarFilename: true,
};

export const USER_PRIVATE_SELECT = {
  id: true,
  username: true,
  avatarFilename: true,
  email: true,
  createdAt: true,
  // -rbauerMod2- age is only exposed on the PRIVATE select (your own
  // "/users/me"), not on USER_PUBLIC_SELECT above — other users searching
  // for you shouldn't see your age, even though the backend still filters
  // by it internally.
  age: true,
  // passwordHash: true,
};