import { IMemberGetter } from './member';

export interface IMessageGetter {
  id: string;
  sender: IMemberGetter;
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
