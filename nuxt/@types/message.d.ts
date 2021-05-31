import type { IMember } from './member';

export interface IMessageWithoutFlag {
  id: string;
  sender: IMember;
  text: string;
  time: number;
  edited: boolean;
  quoteRef?: string;
}

export interface IMessageFlags {
  isFirst: boolean;
  isLast: boolean;
  isSend: boolean;
}

export interface IMessage extends IMessageWithoutFlag {
  flags: IMessageFlags;
}

/**
 * messages that are sent in the same day.
 */
type MessagesOfDay = IMessage[];

export type ChunkMessagesGetter = MessagesOfDay[];

interface IQuoteMessage extends Omit<IMessage, 'quoteRef'> {
  quote?: IMessageWithoutFlag;
}

/**
 * first item is **read** messages and second is **unread** messages.
 */
export type MessagesGetter = [IQuoteMessage[][][], IQuoteMessage[][][]];

export interface IUnparsedMessage {
  id: string;
  sender: string;
  text: string;
  quoteRef?: string;
  time: string;
  edited: boolean;
}

export interface ILoadMessage {
  room: string;
  messages: IUnparsedMessage[];
}

export interface ILoadMessageArg {
  roomId?: string;
  from: number;
  dir: 'after' | 'before' | 'both';
}

export interface IAddMessagesArg {
  messages: ILoadMessage;
  isConnected: boolean;
}

export interface IGetMessagesArg {
  roomId: string;
  messages: (string | undefined)[];
}

export interface ISendMessageArg {
  messageText: string;
  quoteRef?: string;
}

export interface IOnMessageArg extends IUnparsedMessage {
  room: string;
}

export interface IEditMessageArg {
  messageId: string;
  messageText: string;
}

export interface IOnEditMessageArg {
  room: string;
  id: string;
  text: string;
}

export interface IOnDeleteMessageArg {
  room: string;
  id: string;
}
