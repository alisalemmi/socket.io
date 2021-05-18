export interface IUnparsedMember {
  id: string;
  name: string;
  image: string;
  lastSeen: string | 'online';
}

export interface IUserConnect {
  userId: string;
}

export interface IUserDisconnect {
  userId: string;
  time: string;
}
