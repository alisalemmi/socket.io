import type { ChunkMessagesGetter } from '@/@types';

import { Members } from '@/store';

import { isSameDay } from '@/util/time/getPersianDate';
import { Message } from './message';

export class Chunk {
  private _messages: Message[];

  /**
   * @param messages must be **sorted**
   */
  constructor(messages: Message[]) {
    this._messages = messages;
  }

  get messages(): ChunkMessagesGetter {
    const chunkMessages: ChunkMessagesGetter = [];
    let [...msgs] = this._messages;

    while (msgs.length) {
      const t = msgs.splice(
        msgs.findIndex(
          (msg, i) =>
            i + 1 >= msgs.length || !isSameDay(msg.time, msgs[i + 1].time)
        ) + 1
      );

      chunkMessages.push(
        msgs.map(msg => ({
          id: msg.id,
          sender: Members.getMember(msg.sender),
          text: msg.text,
          time: msg.time,
          edited: msg.edited
        }))
      );

      msgs = t;
    }

    return chunkMessages;
  }

  get lastMessage() {
    return this._messages.length
      ? this._messages[this._messages.length - 1]
      : undefined;
  }

  get from() {
    return this._messages.length ? this._messages[0].time : 0;
  }

  get to() {
    return this.lastMessage?.time || 0;
  }

  private insert(message: Message) {
    let start = 0;
    let end = this._messages.length - 1;
    let mid = 0;
    let i = end + 1;

    while (start <= end) {
      mid = Math.floor((start + end) / 2);

      if (this._messages[mid].time <= message.time) {
        start = mid + 1;
      } else {
        i = mid;
        end = mid - 1;
      }
    }

    if (i > 0 && this._messages[i - 1].id === message.id)
      this._messages.splice(i - 1, 1, message);
    else this._messages.splice(i, 0, message);
  }

  add(messages: Message[]) {
    messages.forEach(message => this.insert(message));
  }

  merge(chunk: this) {
    this.add(chunk._messages);
  }
}
