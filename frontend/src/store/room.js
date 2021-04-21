import Vue from 'vue';

export default {
  state: {
    rooms: {},
    currentRoom: ''
  },
  getters: {
    rooms: (state, { lastMessages }) => {
      return Object.entries(state.rooms)
        .sort(([a], [b]) => lastMessages[b].time - lastMessages[a].time)
        .map(([id, room]) => ({
          id,
          lastMessage: lastMessages[id],
          members: Object.entries(room.members)
            .filter(([id]) => id !== state.me)
            .map(([id, { lastSeenMessage }]) => {
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
    },
    currentRoom: state => state.rooms[state.currentRoom]
  },
  mutations: {
    setRooms: (state, rooms) => {
      for (const room of rooms) {
        Vue.set(state.rooms, room.id, {
          members: {},
          messages: {},
          lostMessages: new Set()
        });

        // set members
        room.members.forEach(({ id, ...member }) =>
          Vue.set(state.rooms[room.id].members, id, {
            lastSeenMessage: new Date(member.lastSeenMessage).getTime()
          })
        );

        // set last message
        if (room.lastMessage) {
          Vue.set(state.rooms[room.id].messages, room.lastMessage.id, {
            text: room.lastMessage.text,
            time: new Date(room.lastMessage.time).getTime(),
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
    changeRoom: ({ state, getters, commit, dispatch }, newRoomId) => {
      // store lastSeenMessage of old room
      if (state.currentRoom) dispatch('syncLastSeenMessage');

      state.currentRoom = newRoomId;

      // load lastSeenMessage of new room
      commit('resetLastSeenMessage', getters.meInCurrentRoom.lastSeenMessage);

      commit('removeTyping');
      // TODO save message in draft
    }
  }
};
