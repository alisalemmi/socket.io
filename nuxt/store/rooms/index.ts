import Vue from 'vue';
import { VuexModule, Module, Mutation } from 'vuex-module-decorators';

import { Room } from './room';
import type { IUnparsedRoom } from './room';

@Module({ stateFactory: true, name: 'rooms', namespaced: true })
export default class Rooms extends VuexModule {
  currentRoom: string | null = null;
  readonly rooms: { readonly [id: string]: Room | undefined } = {};

  @Mutation
  onRooms(rooms: IUnparsedRoom[]) {
    rooms.forEach(room => {
      // FIXME: nead `Vue.set`?
      Vue.set(this.rooms, room.id, new Room(room.members, room.lastMessage));
    });
  }
}
