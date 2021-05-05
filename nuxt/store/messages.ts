import { VuexModule, Module } from 'vuex-module-decorators';

@Module({ stateFactory: true, name: 'messages' })
export default class Messages extends VuexModule {}
