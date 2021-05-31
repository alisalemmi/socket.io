import Vue from 'vue';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

import type {
  IUnparsedRoom,
  ILoadMessage,
  ILoadMessageArg,
  MessagesGetter,
  RoomsGetter,
  ISendMessageArg,
  IOnMessageArg,
  IEditMessageArg,
  IOnEditMessageArg,
  IGetMessagesArg,
  IAddMessagesArg
} from '@/@types';

import { $socket } from '@/util/initialize/socket.io';
import { Room } from './room';

@Module({ stateFactory: true, name: 'rooms', namespaced: true })
export default class Rooms extends VuexModule {
  currentRoom: string | null = null;
  private _rooms: { readonly [id: string]: Room | undefined } = {};

  get rooms(): RoomsGetter {
    return Object.entries(this._rooms)
      .sort(
        ([_1, r1], [_2, r2]) =>
          (r2?.lastMessage?.time ?? 0) - (r1?.lastMessage?.time ?? 0)
      )
      .map(([id, room]) => ({
        id,
        members: room?.members,
        lastMessage: room?.lastMessage,
        unread: 0
      }));
  }

  get messages(): MessagesGetter {
    if (!this.currentRoom) return [[], []];
    return this._rooms[this.currentRoom]?.messages ?? [[], []];
  }

  get isEmptyRoom() {
    return this.currentRoom
      ? this._rooms[this.currentRoom]?.lastMessage === undefined
      : true;
  }

  @Mutation
  onRooms(rooms: IUnparsedRoom[]) {
    rooms.forEach(room => {
      Vue.set(this._rooms, room.id, new Room(room.members, room.lastMessage));
    });
  }

  @Mutation
  private setCurrentRoom(roomId: string) {
    this.currentRoom = roomId;
  }

  @Action
  async changeRoom(roomId: string) {
    if (roomId in this._rooms) {
      await this.loadMessage({
        roomId,
        from: this._rooms[roomId]?.lastSeen || 0,
        dir: 'both'
      });

      this.setCurrentRoom(roomId);
    }
  }

  @Mutation
  private addMessages({ messages, isConnected }: IAddMessagesArg) {
    const room = this._rooms[messages.room];

    if (isConnected) room?.addMessages(messages.messages);
    else
      messages.messages.forEach(message => room?.addMessages(message, false));
  }

  @Action
  loadMessage({ roomId, from, dir }: ILoadMessageArg): Promise<void> {
    if (dir === 'both') {
      const p1 = this.loadMessage({ roomId, from, dir: 'after' });
      const p2 = this.loadMessage({ roomId, from, dir: 'before' });

      return Promise.all([p1, p2]).then(() => undefined);
    } else
      return new Promise(resolve =>
        $socket.emit(
          'getHistory',
          {
            room: roomId || this.currentRoom,
            date: from,
            direction: dir === 'before'
          },
          (messages: ILoadMessage) => {
            this.addMessages({ messages, isConnected: true });

            // handle quotes
            this.getMessages({
              roomId: messages.room,
              messages: messages.messages.map(message => message.quoteRef)
            }).then(resolve);
          }
        )
      );
  }

  @Action
  getMessages({ roomId, messages }: IGetMessagesArg): Promise<void> {
    const msgSet = new Set(messages);
    msgSet.delete(undefined);

    const lostMessages = this._rooms[roomId]?.getLostMessages(
      msgSet as Set<string>
    );

    return new Promise(resolve => {
      if (lostMessages?.size)
        $socket.emit(
          'getMessages',
          { room: roomId, messages: [...lostMessages] },
          (messages: ILoadMessage) => {
            this.addMessages({ messages, isConnected: false });

            resolve();
          }
        );
      else resolve();
    });
  }

  @Mutation
  onMessage(message: IOnMessageArg) {
    // TODO quote
    this._rooms[message.room]?.addMessages(message, true);
  }

  @Action
  sendMessage({ messageText, quoteRef }: ISendMessageArg) {
    const text = messageText.trim();

    if (this.currentRoom && text)
      $socket.emit('sendMessage', { room: this.currentRoom, text, quoteRef });
  }

  @Mutation
  onEdit(message: IOnEditMessageArg) {
    this._rooms[message.room]?.editMessage(message.id, message.text);
  }

  @Action
  editMessage({ messageId, messageText }: IEditMessageArg) {
    const text = messageText.trim();

    if (this.currentRoom && messageId && text)
      $socket.emit('sendEdit', messageId, text);
  }
}
