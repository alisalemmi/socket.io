import Vue from 'vue';

import type {
  IUnparsedRoomMember,
  IUnparsedMessage,
  MembersGetter
} from '@/@types';

import { Members } from '@/store';
import { MessageList } from './messages';

export class Room {
  private membersLastSeen: { readonly [id: string]: number | undefined } = {};
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

  get members(): MembersGetter {
    return Object.keys(this.membersLastSeen)
      .filter(memberId => memberId !== Members.me)
      .map(memberId => Members.getMember(memberId));
  }

  get lastSeen() {
    return Members.me ? this.membersLastSeen[Members.me] ?? 0 : 0;
  }
}
