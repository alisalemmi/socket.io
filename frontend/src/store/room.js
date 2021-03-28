import Vue from 'vue';

export default {
  state: {
    rooms: {},
    currentRoom: ''
  },
  getters: {
    rooms: (state, getters) => {
      return Object.entries(state.rooms)
        .sort(
          ([a], [b]) =>
            new Date(getters.lastMessages[b].time || 0) -
            new Date(getters.lastMessages[a].time || 0)
        )
        .map(([id, room]) => ({
          id,
          lastMessage: getters.lastMessages[id],
          members: room.members
            .filter(({ id }) => id !== state.me)
            .map(({ id, lastSeenMessage }) => {
              const member = state.members[id] || {};

              return {
                id,
                name: member.name,
                image: member.image,
                lastSeen: member.lastSeen,
                lastSeenMessage
              };
            })
        }));
    }
  },
  mutations: {
    setRooms: (state, rooms) => {
      for (const room of rooms) {
        Vue.set(state.rooms, room.id, {
          members: room.members,
          messages: {},
          lostMessages: new Set()
        });

        // set last message
        if (room.lastMessage) {
          Vue.set(state.rooms[room.id].messages, room.lastMessage.id, {
            text: room.lastMessage.text,
            time: room.lastMessage.time,
            sender: room.lastMessage.sender,
            edited: room.lastMessage.edited,
            quoteRef: room.lastMessage.quoteRef
          });

          if (room.lastMessage.quoteRef)
            state.rooms[room.id].lostMessages.add(room.lastMessage.quoteRef);
        }
      }
    }
  },
  actions: {
    onRooms: ({ getters, commit, dispatch }, rooms) => {
      commit('setRooms', rooms);
      dispatch('changeRoom', getters.rooms[0]?.id);
    },
    changeRoom: ({ state, commit }, newRoomId) => {
      state.currentRoom = newRoomId;
      commit('removeTyping');
      // TODO save message in draft
    }
  }
};
