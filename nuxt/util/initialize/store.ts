/* eslint-disable import/no-mutable-exports */
import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';

import MembersClass from '@/store/members';
import RoomsClass from '@/store/rooms';
import MessagesClass from '@/store/messages';
import TypingUsersClass from '@/store/typingUsers';

let Members: MembersClass;
let Rooms: RoomsClass;
let Messages: MessagesClass;
let TypingUsers: TypingUsersClass;

function initialiseStores(store: Store<any>): void {
  Members = getModule(MembersClass, store);
  Rooms = getModule(RoomsClass, store);
  Messages = getModule(MessagesClass, store);
  TypingUsers = getModule(TypingUsersClass, store);
}

export { initialiseStores, Members, Rooms, Messages, TypingUsers };
