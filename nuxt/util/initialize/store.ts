/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

import MembersClass from '@/store/members';
import RoomsClass from '@/store/rooms';
import TypingUsersClass from '@/store/typingUsers';

let Members: MembersClass;
let Rooms: RoomsClass;
let TypingUsers: TypingUsersClass;

function initializeStores(store: Store<any>): void {
  Members = getModule(MembersClass, store);
  Rooms = getModule(RoomsClass, store);
  TypingUsers = getModule(TypingUsersClass, store);
}

export { initializeStores, Members, Rooms, TypingUsers };
