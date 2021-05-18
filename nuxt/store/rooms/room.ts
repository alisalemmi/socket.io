import Vue from 'vue';

import type { IUnparsedRoomMember, IUnparsedMessage } from '@/@types';

import { Members } from '@/store';
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

  get members() {
    return Object.keys(this.membersLastSeen)
      .filter(memberId => memberId !== Members.me)
      .map(memberId => {
        const member = Members.members[memberId];

        return {
          name: member?.name,
          image: member?.image,
          lastSeen: member?.lastSeen
        };
      });
  }
}
