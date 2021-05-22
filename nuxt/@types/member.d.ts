export interface IUnparsedMember {
  id: string;
  name: string;
  image: string;
  lastSeen: string | 'online';
}

export interface IMember {
  id: string;
  name: string;
  image: string;
  lastSeen: number | 'online';
}

export type MembersGetter = IMember[];

export interface IUserConnect {
  userId: string;
}

export interface IUserDisconnect {
  userId: string;
  time: string;
}
