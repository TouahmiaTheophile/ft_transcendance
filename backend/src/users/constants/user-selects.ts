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
  // -rbauerMod2- age is exposed only on the PRIVATE select ("/users/me"), not
  // above: other users must not see it, even though the search filters on it.
  age: true,
  // passwordHash: true,
};