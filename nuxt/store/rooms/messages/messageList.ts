import type { IUnparsedMessage, MessagesGetter } from '@/@types';

import { Message } from './message';
import { Chunk } from './chunk';

export abstract class MessageList {
  protected chunks: Chunk[] = [];

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

  get lastMessage() {
    return this.chunks[this.chunks.length - 1]?.lastMessage;
  }

  abstract get messages(): MessagesGetter;

  addMessages(messages: IUnparsedMessage[]): void;
  addMessages(message: IUnparsedMessage, addToLastChunk?: boolean): void;
  addMessages(
    message: IUnparsedMessage | IUnparsedMessage[],
    addToLastChunk = false
  ) {
    // parse argument
    const messages = (!Array.isArray(message) ? [message] : message)
      .map(
        ({ id, text, sender, time, edited, quoteRef }) =>
          new Message(id, text, sender, time, edited, quoteRef)
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
    // insert to last chunk
    else if (addToLastChunk) {
      this.chunks[this.chunks.length - 1].add(messages);
    } else {
      // create new chunk
      const chunk = new Chunk(messages);
      this.chunks.splice(this.getChunkPosition(chunk.from), 0, chunk);
    }
  }

  private findMessage(messageId: string): [number, number] {
    let i = -1;
    let j = -1;

    for (i = this.chunks.length - 1; i >= 0; i--) {
      j = this.chunks[i].findMessage(messageId);

      if (j >= 0) break;
    }

    return [i, j];
  }

  getMessage(messageId: string) {
    const [i, j] = this.findMessage(messageId);

    if (i >= 0 && j >= 0) return this.chunks[i].getMessage(j);
  }

  getLostMessages(messages: Set<string>) {
    const lostMessages = new Set<string>();

    for (const messageId of messages) {
      const [i, j] = this.findMessage(messageId);

      if (i === -1 && j === -1) lostMessages.add(messageId);
    }

    return lostMessages;
  }

  editMessage(messageId: string, newText: string) {
    const [i, j] = this.findMessage(messageId);

    if (i >= 0 && j >= 0) this.chunks[i].editMessage(j, newText);
  }

  deleteMessage(messageId: string) {
    const [i, j] = this.findMessage(messageId);

    if (i >= 0 && j >= 0) {
      const beEmpty = this.chunks[i].deleteMessage(j);

      if (beEmpty) {
        this.chunks.splice(i, 1);

        return i === this.chunks.length;
      }
    }

    return false;
  }
}
