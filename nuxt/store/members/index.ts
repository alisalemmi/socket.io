import { VuexModule, Module, Mutation } from 'vuex-module-decorators';
import { Member } from './member';

import type { IUnparsedMember, IUserConnect, IUserDisconnect } from './member';

@Module({ stateFactory: true, name: 'members' })
export default class Members extends VuexModule {
  me: string | null = null;
  members = new Map<string, Member>();

  @Mutation
  onMe(userId: string) {
    this.me = userId;
  }

  @Mutation
  onMembers(members: IUnparsedMember[]) {
    members.forEach(member =>
      this.members.set(
        member.id,
        new Member(member.name, member.image, member.lastSeen)
      )
    );
  }

  @Mutation
  onUserConnect({ userId }: IUserConnect) {
    const member = this.members.get(userId);

    if (member) member.lastSeen = 'online';
  }

  @Mutation
  onUserDisconnect({ userId, time }: IUserDisconnect) {
    const member = this.members.get(userId);

    if (member) member.lastSeen = new Date(time).getTime();
  }
}
