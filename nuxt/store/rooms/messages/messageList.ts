import { Message } from './message';
import { Chunk } from './chunk';

import type { IUnparsedMessage } from './message';

export class MessageList {
  private chunks: Chunk[] = [];

  /**
   * @param from `from` of new chunk
   * @returns position that new chunk can be inserted
   */
  private getChunkPosition(from: number) {
    let start = 0;
    let end = this.chunks.length - 1;
    let mid = 0;
    let ans = -1;

    while (start <= end) {
      mid = Math.floor((start + end) / 2);

      if (this.chunks[mid].to <= from) {
        start = mid + 1;
      } else {
        ans = mid;
        end = mid - 1;
      }
    }

    return ans;
  }

  private merge(index: number) {
    let i = index;

    while (
      i < this.chunks.length - 1 &&
      this.chunks[i].to >= this.chunks[i + 1].from
    ) {
      this.chunks[i].merge(this.chunks[i + 1]);
      this.chunks.splice(i + 1, 1);
    }

    while (i > 0 && this.chunks[i - 1].to >= this.chunks[i].from) {
      this.chunks[i].merge(this.chunks[i - 1]);
      this.chunks.splice(i - 1, 1);
      i--;
    }
  }

  add(message: IUnparsedMessage[]): void;
  add(messages: IUnparsedMessage): void;
  add(message: IUnparsedMessage | IUnparsedMessage[]) {
    // parse argument
    const messages = (!Array.isArray(message) ? [message] : message)
      .map(
        ({ id, text, sender, time, edited }) =>
          new Message(id, text, sender, time, edited)
      )
      .sort((m, n) => m.time - n.time);

    if (!messages.length) return;

    const from = messages[0].time;
    const to = messages[messages.length - 1].time;

    // insert into chunk
    const i = this.chunks.findIndex(
      chunk =>
        (chunk.from <= from && from <= chunk.to) ||
        (chunk.from <= to && to <= chunk.to) ||
        (from <= chunk.from && chunk.to <= to)
    );

    if (i >= 0) {
      this.chunks[i].add(messages);
      this.merge(i);
    }
    // create new chunk
    else {
      const chunk = new Chunk(messages);
      this.chunks.splice(this.getChunkPosition(chunk.from), 0, chunk);
    }
  }
}
