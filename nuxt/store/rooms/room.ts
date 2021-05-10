import Vue from 'vue';

import { MessageList } from './messages';
import type { IUnparsedMessage } from './messages';

interface IUnparsedRoomMember {
  id: string;
  lastSeenMessage: string;
}

export interface IUnparsedRoom {
  id: string;
  members: IUnparsedRoomMember[];
  lastMessage?: IUnparsedMessage;
}

export class Room {
  private membersLastSeen: { readonly [id: string]: number } = {};
  messages = new MessageList();

  constructor(members: IUnparsedRoomMember[], lastMessage?: IUnparsedMessage) {
    members.forEach(member =>
      // FIXME: nead `Vue.set`?
      Vue.set(
        this.membersLastSeen,
        member.id,
        new Date(member.lastSeenMessage).getTime() || 0
      )
    );

    if (lastMessage) this.messages.add(lastMessage);
  }
}
