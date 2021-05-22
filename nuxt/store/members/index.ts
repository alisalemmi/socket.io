import Vue from 'vue';
import { VuexModule, Module, Mutation } from 'vuex-module-decorators';

import type {
  IUnparsedMember,
  IUserConnect,
  IUserDisconnect,
  IMember
} from '@/@types';

import { Member } from './member';

@Module({ stateFactory: true, name: 'members', namespaced: true })
export default class Members extends VuexModule {
  private _me: string | null = null;
  private readonly members: { readonly [id: string]: Member | undefined } = {};

  get me() {
    return this._me;
  }

  get getMember() {
    return (memberId: string): IMember => {
      const member = this.members[memberId];

      return {
        id: memberId,
        name: member?.name ?? '',
        image: member?.image ?? '',
        lastSeen: member?.lastSeen ?? 0
      };
    };
  }

  @Mutation
  onMe(userId: string) {
    this._me = userId;
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
