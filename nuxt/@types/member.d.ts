export interface IUnparsedMember {
  id: string;
  name: string;
  image: string;
  lastSeen: string | 'online';
}

export type MembersGetter = {
  id: string;
  name: string;
  image: string;
  lastSeen: number | 'online';
}[];

export interface IUserConnect {
  userId: string;
}

export interface IUserDisconnect {
  userId: string;
  time: string;
}
