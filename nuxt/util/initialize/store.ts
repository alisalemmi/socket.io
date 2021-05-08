/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

import MembersClass from '@/store/members';
import RoomsClass from '@/store/rooms';
import MessagesClass from '@/store/messages';

let Members: MembersClass;
let Rooms: RoomsClass;
let Messages: MessagesClass;

function initialiseStores(store: Store<any>): void {
  Members = getModule(MembersClass, store);
  Rooms = getModule(RoomsClass, store);
  Messages = getModule(MessagesClass, store);
}

export { initialiseStores, Members, Rooms, Messages };
