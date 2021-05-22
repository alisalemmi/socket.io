import Vue from 'vue';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

import type { IUnparsedRoom, ILoadMessage, ILoadMessageArg } from '@/@types';

import { $socket } from '@/util/initialize/socket.io';
import { Room } from './room';

@Module({ stateFactory: true, name: 'rooms', namespaced: true })
export default class Rooms extends VuexModule {
  currentRoom: string | null = null;
  private _rooms: { readonly [id: string]: Room | undefined } = {};

  get rooms() {
    return Object.entries(this._rooms)
      .sort(
        ([_1, r1], [_2, r2]) =>
          (r2?.lastMessage?.time ?? 0) - (r1?.lastMessage?.time ?? 0)
      )
      .map(([id, room]) => ({
        id,
        members: room?.members,
        unread: 0,
        lastMessage: room?.lastMessage
      }));
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

      this.loadMessage({
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
  loadMessage({ from, dir }: ILoadMessageArg) {
    if (dir === 'both') {
      this.loadMessage({ from, dir: 'after' });
      this.loadMessage({ from, dir: 'before' });
    } else
      $socket.emit(
        'getHistory',
        {
          room: this.currentRoom,
          date: from,
          direction: dir === 'before'
        },
        this.addMessages
      );
  }
}
