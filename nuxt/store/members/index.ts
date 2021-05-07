import { VuexModule, Module, Mutation } from 'vuex-module-decorators';
import {
  Member,
  IUnparsedMember,
  IUserConnect,
  IUserDisconnect
} from './member';

@Module({ stateFactory: true, name: 'members' })
export default class Members extends VuexModule {
  userId: string | null = null;
  members = new Map<string, Member>();

  @Mutation
  atMe(userId: string) {
    this.userId = userId;
  }

  @Mutation
  atMembers(members: IUnparsedMember[]) {
    members.forEach(member =>
      this.members.set(
        member.id,
        new Member(member.name, member.image, member.lastSeen)
      )
    );
  }

  @Mutation
  atUserConnect({ userId }: IUserConnect) {
    const member = this.members.get(userId);

    if (member) member.lastSeen = 'online';
  }

  @Mutation
  atUserDisconnect({ userId, time }: IUserDisconnect) {
    const member = this.members.get(userId);

    if (member) member.lastSeen = new Date(time).getTime();
  }
}
