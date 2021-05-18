import { Message } from './message';

export class Chunk {
  private messages: Message[];

  /**
   * @param messages must be **sorted**
   */
  constructor(messages: Message[]) {
    this.messages = messages;
  }

  get lastMessage() {
    return this.messages.length
      ? this.messages[this.messages.length - 1]
      : undefined;
  }

  get from() {
    return this.messages.length ? this.messages[0].time : 0;
  }

  get to() {
    return this.lastMessage?.time || 0;
  }

  private insert(message: Message) {
    let start = 0;
    let end = this.messages.length - 1;
    let mid = 0;
    let i = end + 1;

    while (start <= end) {
      mid = Math.floor((start + end) / 2);

      if (this.messages[mid].time <= message.time) {
        start = mid + 1;
      } else {
        i = mid;
        end = mid - 1;
      }
    }

    if (i > 0 && this.messages[i - 1].id === message.id)
      this.messages.splice(i - 1, 1, message);
    else this.messages.splice(i, 0, message);
  }

  add(messages: Message[]) {
    messages.forEach(message => this.insert(message));
  }

  merge(chunk: this) {
    this.add(chunk.messages);
  }
}
