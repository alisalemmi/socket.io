import type { IMember } from './member';

export interface IMessageFlags {
  isFirst: boolean;
  isLast: boolean;
  isSend: boolean;
}

export interface IMessage {
  id: string;
  sender: IMember;
  text: string;
  time: number;
  edited: boolean;
  flags: IMessageFlags;
}

/**
 * messages that are sent in the same day.
 */
type MessagesOfDay = IMessage[];

export type ChunkMessagesGetter = MessagesOfDay[];

/**
 * first item is **read** messages and second is **unread** messages.
 */
export type MessagesGetter = [ChunkMessagesGetter[], ChunkMessagesGetter[]];

export interface IUnparsedMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  edited: boolean;
}

export interface ILoadMessage {
  room: string;
  messages: IUnparsedMessage[];
}

export interface ILoadMessageArg {
  roomId: string;
  from: number;
  dir: 'after' | 'before' | 'both';
}
