import Vue from 'vue';
import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

import type { IUnparsedRoom } from '@/@types';

import { Room } from './room';

@Module({ stateFactory: true, name: 'rooms', namespaced: true })
export default class Rooms extends VuexModule {
  currentRoom: string | null = null;
  private _rooms: { readonly [id: string]: Room | undefined } = {};

  get rooms() {
    return Object.entries(this._rooms)
      .sort(
        ([_1, r1], [_2, r2]) =>
          (r2?.messages.lastMessage?.time ?? 0) -
          (r1?.messages.lastMessage?.time ?? 0)
      )
      .map(([id, room]) => ({
        id,
        members: room?.members,
        unread: 0,
        lastMessage: room?.messages?.lastMessage
      }));
  }

  @Mutation
  changeRoom(roomId: string) {
    if (roomId in this._rooms) {
      this.currentRoom = roomId;
    }
  }

  @Mutation
  setRooms(rooms: IUnparsedRoom[]) {
    rooms.forEach(room => {
      Vue.set(this._rooms, room.id, new Room(room.members, room.lastMessage));
    });
  }

  @Action
  atRooms(rooms: IUnparsedRoom[]) {
    this.setRooms(rooms);
  }
}
