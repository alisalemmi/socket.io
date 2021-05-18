import Vue from 'vue';

import type { IUnparsedRoomMember, IUnparsedMessage } from '@/@types';

import { MessageList } from './messages';

export class Room {
  private membersLastSeen: { readonly [id: string]: number } = {};
  messages = new MessageList();

  constructor(members: IUnparsedRoomMember[], lastMessage?: IUnparsedMessage) {
    members.forEach(member =>
      Vue.set(
        this.membersLastSeen,
        member.id,
        new Date(member.lastSeenMessage).getTime() || 0
      )
    );

    if (lastMessage) this.messages.add(lastMessage);
  }
}
