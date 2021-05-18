import { IUnparsedMessage } from './message';

export interface IUnparsedRoomMember {
  id: string;
  lastSeenMessage: string;
}

export interface IUnparsedRoom {
  id: string;
  members: IUnparsedRoomMember[];
  lastMessage?: IUnparsedMessage;
}
