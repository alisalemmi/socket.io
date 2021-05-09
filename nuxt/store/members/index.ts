import Vue from 'vue';
import { VuexModule, Module, Mutation } from 'vuex-module-decorators';

import { Member } from './member';

import type { IUnparsedMember, IUserConnect, IUserDisconnect } from './member';

@Module({ stateFactory: true, name: 'members', namespaced: true })
export default class Members extends VuexModule {
  me: string | null = null;
  readonly members: { readonly [id: string]: Member | undefined } = {};

  @Mutation
  onMe(userId: string) {
    this.me = userId;
  }

  @Mutation
  onMembers(members: IUnparsedMember[]) {
    members.forEach(member =>
      Vue.set(
        this.members,
        member.id,
        new Member(member.name, member.image, member.lastSeen)
      )
    );
  }

  @Mutation
  onUserConnect({ userId }: IUserConnect) {
    const member = this.members[userId];

    if (member) member.lastSeen = 'online';
  }

  @Mutation
  onUserDisconnect({ userId, time }: IUserDisconnect) {
    const member = this.members[userId];

    if (member) member.lastSeen = new Date(time).getTime();
  }
}
