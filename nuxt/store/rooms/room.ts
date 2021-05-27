import Vue from 'vue';

import type {
  IUnparsedRoomMember,
  IUnparsedMessage,
  MembersGetter,
  MessagesGetter
} from '@/@types';

import { Members } from '@/store';
import { MessageList } from './messages';

export class Room extends MessageList {
  private membersLastSeen: { readonly [id: string]: number | undefined } = {};

  constructor(members: IUnparsedRoomMember[], lastMessage?: IUnparsedMessage) {
    super();

    members.forEach(member =>
      Vue.set(
        this.membersLastSeen,
        member.id,
        new Date(member.lastSeenMessage).getTime() || 0
      )
    );

    if (lastMessage) this.addMessages(lastMessage);
  }

  get members(): MembersGetter {
    return Object.keys(this.membersLastSeen)
      .filter(memberId => memberId !== Members.me)
      .map(memberId => Members.getMember(memberId));
  }

  get messages(): MessagesGetter {
    // 1. get messages
    const chunks = this.chunks.map(chunk => chunk.messages);

    // 2. find last read messages
    let chunkIndex = -1;
    let dayIndex = -1;
    let messageIndex = -1;

    for (let i = chunks.length - 1; i >= 0; i--) {
      if (chunks[i][0][0].time > this.lastSeen) continue;

      for (let j = chunks[i].length - 1; j >= 0; j--) {
        if (chunks[i][j][0].time > this.lastSeen) continue;

        for (let k = chunks[i][j].length - 1; k >= 0; k--) {
          if (chunks[i][j][k].time <= this.lastSeen) {
            chunkIndex = i;
            dayIndex = j;
            messageIndex = k;
            break;
          }
        }

        if (messageIndex >= 0) break;
      }

      if (messageIndex >= 0) break;
    }

    // 3. split messages to read and unread

    // no read messages
    if (chunkIndex < 0) return [[], chunks];

    const firstUnreadMessages = chunks[chunkIndex][dayIndex].splice(
      messageIndex + 1
    );
    const firstUnreadDays = chunks[chunkIndex].splice(dayIndex + 1);
    const otherChunks = chunks.splice(chunkIndex + 1);

    const firstUnreadChunk =
      firstUnreadMessages.length || firstUnreadDays.length
        ? [firstUnreadMessages].concat(firstUnreadDays)
        : [];

    const unreadMessages =
      firstUnreadChunk.length || otherChunks.length
        ? [firstUnreadChunk].concat(otherChunks)
        : [];

    return [chunks, unreadMessages];
  }

  get lastSeen() {
    return Members.me ? this.membersLastSeen[Members.me] ?? 0 : 0;
  }
}
