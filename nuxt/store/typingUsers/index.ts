import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

import type { ITypingUser } from '@/@types';

import { $socket } from '@/util/initialize/socket.io';
import { Rooms, Members } from '@/store';

@Module({ stateFactory: true, name: 'typingUsers', namespaced: true })
export default class TypingUsers extends VuexModule {
  private _users: string[] = [];
  private timeOut: Map<string, number> = new Map();
  private lastSend = 0;

  get users() {
    return this._users
      .map(user => Members.members[user]?.name)
      .filter(name => name);
  }

  @Mutation
  private addUser(userId: string) {
    if (this._users.includes(userId)) clearTimeout(this.timeOut.get(userId));
    else this._users.push(userId);
  }

  @Mutation
  private removeUser(userId: string) {
    const i = this._users.indexOf(userId);

    if (i >= 0) {
      this._users.splice(i, 1);
      this.timeOut.delete(userId);
    }
  }

  @Action
  atTyping(payload: ITypingUser) {
    if (payload.room === Rooms.currentRoom && payload.userId !== Members.me) {
      this.addUser(payload.userId);

      this.timeOut.set(
        payload.userId,
        (setTimeout(() => {
          this.removeUser(payload.userId);
        }, payload.expires) as unknown) as number
      );
    }
  }

  @Mutation
  type() {
    const now = Date.now();

    if (Rooms.currentRoom && now - this.lastSend > 2000) {
      this.lastSend = now;
      $socket.emit('sendTyping', Rooms.currentRoom);
    }
  }
}
