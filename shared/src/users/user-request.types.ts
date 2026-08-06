export type RegisterUserRequest = {
  username: string;
  email: string;
  password: string;
  age: number; // -rbauerMod2- required at registration — validated as a whole number from 0 to 150
};

export type UpdateUserRequest = {
  email?: string;
  newPassword?: string;
  // Required when email or newPassword is provided
  currentPassword?: string;
  age?: number; // -rbauerMod2- not sensitive — can be changed anytime, no currentPassword needed
};

export type DeleteUserRequest = {
  password: string;
};

// -rbauerMod2- The shape of a "search users" request, shared between
// frontend and backend so both sides always agree on what fields exist.
// Every field is optional: a caller can search by text only, filter only,
// or mix both.
export type SearchUsersRequest = {
  query?: string; // -rbauerMod2- free-text match on the username
  ageMin?: number; // -rbauerMod2- filter: only users this age or older
  ageMax?: number; // -rbauerMod2- filter: only users this age or younger
  excludeIds?: number[]; // -rbauerMod2- filter: hide these user ids from the results (e.g. self + friends)
  sortBy?: 'username' | 'createdAt'; // -rbauerMod2- sorting: which column to order by
  order?: 'asc' | 'desc'; // -rbauerMod2- sorting: ascending or descending
  page?: number; // -rbauerMod2- pagination: 1-based page number
  limit?: number; // -rbauerMod2- pagination: how many results per page
};