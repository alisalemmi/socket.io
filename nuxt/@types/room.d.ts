import { Message } from '@/store/rooms/messages/message';
import type { IUnparsedMessage } from './message';
import type { MembersGetter } from './member';

export interface IRoom {
  id: string;
  members: MembersGetter | undefined;
  lastMessage: Message | undefined;
  unread: number;
}

export type RoomsGetter = IRoom[];

export interface IUnparsedRoomMember {
  id: string;
  lastSeenMessage: string;
}

export interface IUnparsedRoom {
  id: string;
  members: IUnparsedRoomMember[];
  lastMessage?: IUnparsedMessage;
}
