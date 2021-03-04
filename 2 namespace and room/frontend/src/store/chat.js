import Vue from 'vue';
import socket from '@/socket';

export default {
  namespaced: true,
  state: {
    me: {
      id: '',
      name: '',
      image: ''
    },
    rooms: {},
    currentRoom: '',
    typing: {
      users: [],
      timeout: {},
      lastSend: 0
    }
  },
  getters: {
    rooms: state => {
      return Object.entries(state.rooms)
        .sort(
          ([, a], [, b]) =>
            new Date(b?.lastMessage?.time || 0) -
            new Date(a?.lastMessage?.time || 0)
        )
        .map(([id, room]) => {
          const members = Object.values(room.members);

          return {
            id,
            lastMessage: {
              text: room.lastMessage.text,
              time: room.lastMessage.time
            },
            name: members.map(m => m.name),
            image: members.map(m => m.image)
          };
        });
    },
    messages: state => {
      return Object.entries(state.rooms[state.currentRoom]?.messages || {})
        .sort(([, a], [, b]) => new Date(a?.time || 0) - new Date(b?.time || 0))
        .map(([id, message], i, arr) => ({
          id,
          ...message,
          senderName:
            state.rooms[state.currentRoom]?.members?.[message.sender]?.name,
          senderImage:
            state.rooms[state.currentRoom]?.members?.[message.sender]?.image,
          continues: i > 0 && arr[i - 1][1].isSend === message.isSend,
          rounded:
            i >= arr.length - 1 || arr[i + 1][1].isSend !== message.isSend
        }));
    },
    members: state => state.rooms[state.currentRoom]?.members,
    typingUsers: state =>
      state.typing.users.map(
        userId => state.rooms[state.currentRoom]?.members?.[userId]?.name
      )
  },
  mutations: {
    mutateMe: (state, me) => {
      ({ id: state.me.id, name: state.me.name, image: state.me.image } = me);
    },
    mutateRooms: (state, rooms) => {
      let lastId = '';
      let lastTime = 0;

      for (const room of rooms) {
        const t = new Date(room.lastMessage?.time);

        if (lastTime < t) {
          lastId = room.id;
          lastTime = t;
        }

        Vue.set(state.rooms, room.id, {
          members: {},
          messages: {},
          lastMessage: {
            text: room.lastMessage?.text,
            time: room.lastMessage?.time
          }
        });

        for (const member of room.members) {
          Vue.set(state.rooms[room.id].members, member._id, {
            name: member.name,
            image: member.image,
            lastSeen: member.lastSeen
          });
        }
      }

      state.currentRoom = lastId || rooms[0]?.id;
    },
    addMessage: (state, message) => {
      if (message.room in state.rooms) {
        Vue.set(state.rooms[message.room].messages, message.id, {
          text: message.text,
          time: message.time,
          sender: message.sender,
          isSend: state.me.id === message.sender
        });

        if (
          new Date(state.rooms[message.room].lastMessage.time || 0) <
          new Date(message.time || 0)
        )
          state.rooms[message.room].lastMessage = {
            text: message.text,
            time: message.time
          };
      }
    },
    mutateHistory: (state, history) => {
      if (history.room in state.rooms)
        for (const message of history.messages) {
          Vue.set(state.rooms[history.room].messages, message.id, {
            text: message.text,
            time: message.time,
            sender: message.sender,
            isSend: state.me.id === message.sender
          });
        }
    },
    mutateTyping: (state, info) => {
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
    changeRoom: ({ state, commit }, newRoomId) => {
      state.currentRoom = newRoomId;
      commit('removeTyping');
    },
    getHistory: ({ state }) => {
      socket.emit('getHistory', state.currentRoom);
    },
    sendMessage: ({ state }, message) => {
      const text = message.trim();
      if (!text) return;

      socket.emit('send', {
        text,
        room: state.currentRoom
      });
    },
    sendTyping: ({ state }) => {
      const now = Date.now();

      if (now - state.typing.lastSend > 2000) {
        state.typing.lastSend = now;
        socket.emit('iAmTyping', state.currentRoom);
      }
    },
    actionMessage: ({ commit }, message) => {
      commit('addMessage', message);
      commit('removeTyping', message.sender);
    }
  }
};
