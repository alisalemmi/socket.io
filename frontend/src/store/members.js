import Vue from 'vue';
import socket from '@/socket';

export default {
  state: {
    me: '',
    members: {},
    typing: {
      users: [],
      timeout: {},
      lastSend: 0
    }
  },
  getters: {
    meInCurrentRoom: (state, getters) =>
      getters.currentRoom?.members?.[state.me],
    typingUsers: state =>
      state.typing.users
        .map(userId => state.members[userId]?.name)
        .filter(name => name)
  },
  mutations: {
    setMe: (state, me) => {
      state.me = me;
    },
    setMembers: (state, members) => {
      members.forEach(member =>
        Vue.set(state.members, member.id, {
          name: member.name,
          image: member.image,
          lastSeen: member.lastSeen
        })
      );
    },
    updateUserStatus: (state, { userId, isConnect, time } = {}) => {
      if (state.members[userId])
        state.members[userId].lastSeen = isConnect
          ? 'online'
          : time || new Date();
    },
    addTyping: (state, info) => {
      if (info.room !== state.currentRoom) return;

      if (state.typing.users.includes(info.userId))
        clearTimeout(state.typing.timeout[info.userId]);
      else state.typing.users.push(info.userId);

      state.typing.timeout[info.userId] = setTimeout(() => {
        state.typing.users = state.typing.users.filter(
          userId => userId !== info.userId
        );
        delete state.typing.timeout[info.userId];
      }, info.expires);
    },
    removeTyping: (state, userId) => {
      for (const user of userId ? [userId] : state.typing.users) {
        clearTimeout(state.typing.timeout[user]);
        delete state.typing.timeout[user];
        state.typing.users = state.typing.users.filter(id => id !== user);
      }
    }
  },
  actions: {
    onMe: ({ commit }, me) => {
      commit('setMe', me);
    },
    onMembers: ({ commit }, members) => {
      commit('setMembers', members);
    },
    onUserConnect: ({ commit }, { userId }) => {
      commit('updateUserStatus', { userId, isConnect: true });
    },
    onUserDisconnect: ({ commit }, { userId, time }) => {
      commit('updateUserStatus', { userId, isConnect: false, time });
    },
    onTyping: ({ commit }, info) => {
      commit('addTyping', info);
    },
    sendTyping: ({ state }) => {
      const now = Date.now();

      if (now - state.typing.lastSend > 2000) {
        state.typing.lastSend = now;
        socket.emit('sendTyping', state.currentRoom);
      }
    }
  }
};
