import Vue from 'vue';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

import type {
  IUnparsedRoom,
  ILoadMessage,
  ILoadMessageArg,
  MessagesGetter,
  RoomsGetter
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
  changeRoom(roomId: string) {
    if (roomId in this._rooms) {
      this.setCurrentRoom(roomId);

      return this.loadMessage({
        from: this._rooms[roomId]?.lastSeen || 0,
        dir: 'both'
      });
    }
  }

  @Mutation
  private addMessages(messages: ILoadMessage) {
    const room = this._rooms[messages.room];

    room?.addMessages(messages.messages);
  }

  @Action
  loadMessage({ from, dir }: ILoadMessageArg): Promise<void> {
    if (dir === 'both') {
      const p1: Promise<void> = this.loadMessage({ from, dir: 'after' });
      const p2: Promise<void> = this.loadMessage({ from, dir: 'before' });

      return Promise.all([p1, p2]).then(() => undefined);
    } else
      return new Promise(resolve =>
        $socket.emit(
          'getHistory',
          {
            room: this.currentRoom,
            date: from,
            direction: dir === 'before'
          },
          (messages: ILoadMessage) => {
            this.addMessages(messages);
            resolve();
          }
        )
      );
  }
}
