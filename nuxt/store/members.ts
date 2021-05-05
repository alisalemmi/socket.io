import { VuexModule, Module } from 'vuex-module-decorators';

@Module({ stateFactory: true, name: 'members' })
export default class Members extends VuexModule {}
