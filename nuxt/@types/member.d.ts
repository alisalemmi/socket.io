export interface IUnparsedMember {
  id: string;
  name: string;
  image: string;
  lastSeen: string | 'online';
}

export interface IMemberGetter {
  id: string;
  name: string;
  image: string;
  lastSeen: number | 'online';
}

export type MembersGetter = IMemberGetter[];

export interface IUserConnect {
  userId: string;
}

export interface IUserDisconnect {
  userId: string;
  time: string;
}
