export interface ITypingUser {
  userId: string;
  room: string;
  expires: number;
}

export type typingUsersGetter = string[];
