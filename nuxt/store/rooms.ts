import { VuexModule, Module } from 'vuex-module-decorators';

@Module({ stateFactory: true, name: 'rooms' })
export default class Rooms extends VuexModule {}
