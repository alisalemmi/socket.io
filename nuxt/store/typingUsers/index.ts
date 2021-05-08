import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';
import { $socket } from '@/util/initialize/socket.io';
import { Rooms, Members } from '@/store';

interface ITypingUser {
  userId: string;
  room: string;
  expires: number;
}

@Module({ stateFactory: true, name: 'typingUsers', namespaced: true })
export default class TypingUsers extends VuexModule {
  readonly users: string[] = [];
  private timeOut: Map<string, number> = new Map();
  private lastSend = 0;

  @Mutation
  private addUser(userId: string) {
    if (this.users.includes(userId)) clearTimeout(this.timeOut.get(userId));
    else this.users.push(userId);
  }

  @Mutation
  private removeUser(userId: string) {
    const i = this.users.indexOf(userId);

    if (i >= 0) {
      this.users.splice(i, 1);
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
