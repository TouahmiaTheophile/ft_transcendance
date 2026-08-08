export type RegisterUserRequest = {
  username: string;
  email: string;
  password: string;
  age: number; // -rbauerMod2- required; whole number from 0 to 150
};

export type UpdateUserRequest = {
  email?: string;
  newPassword?: string;
  // Required when email or newPassword is provided
  currentPassword?: string;
  age?: number; // -rbauerMod2- not sensitive: no currentPassword needed
};

export type DeleteUserRequest = {
  password: string;
};

// -rbauerMod2- Shape of a "search users" request, shared by frontend and backend
// so both agree on the fields. All optional: text only, filters only, or both.
export type SearchUsersRequest = {
  query?: string; // -rbauerMod2- free-text match on the username
  ageMin?: number; // -rbauerMod2- filter: this age or older
  ageMax?: number; // -rbauerMod2- filter: this age or younger
  excludeIds?: number[]; // -rbauerMod2- filter: ids to hide (self, friends)
  sortBy?: 'username' | 'createdAt'; // -rbauerMod2- sorting: column
  order?: 'asc' | 'desc'; // -rbauerMod2- sorting: direction
  page?: number; // -rbauerMod2- pagination: 1-based page number
  limit?: number; // -rbauerMod2- pagination: results per page
};