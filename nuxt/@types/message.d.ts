import { IMember } from './member';

export interface IMessage {
  id: string;
  sender: IMember;
  text: string;
  time: number;
  edited: boolean;
}

/**
 * messages that are sent in the same day.
 */
type MessagesOfDay = IMessage[];

export type ChunkMessagesGetter = MessagesOfDay[];

/**
 * first item is **readed** messages and second is **unreaded** messages.
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
  from: number;
  dir: 'after' | 'before' | 'both';
}
