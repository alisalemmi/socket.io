import { IMember } from './member';

export interface IMessage {
  id: string;
  sender: IMember;
  text: string;
  time: number;
  edited: boolean;
  seen: boolean;
}

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
