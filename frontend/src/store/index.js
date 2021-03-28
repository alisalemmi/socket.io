import Vue from 'vue';
import Vuex from 'vuex';
import room from './room';
import message from './message';
import members from './members';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    ...room.state,
    ...members.state,
    ...message.state
  },
  getters: {
    ...room.getters,
    ...members.getters,
    ...message.getters
  },
  mutations: {
    ...room.mutations,
    ...members.mutations,
    ...message.mutations
  },
  actions: {
    ...room.actions,
    ...members.actions,
    ...message.actions
  }
});
