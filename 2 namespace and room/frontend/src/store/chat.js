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
    },
    lostMessages: new Set()
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
      let isNextTimeline = true;

      return Object.entries(state.rooms[state.currentRoom]?.messages || {})
        .sort(([, a], [, b]) => new Date(a?.time || 0) - new Date(b?.time || 0))
        .map(([id, message], i, arr) => {
          const timeline = isNextTimeline;

          isNextTimeline =
            i >= arr.length - 1 ||
            new Date(message.time).toLocaleDateString('fa', {
              dateStyle: 'medium'
            }) !==
              new Date(arr[i + 1][1].time).toLocaleDateString('fa', {
                dateStyle: 'medium'
              });

          const { quoteRef, ...msg } = message;
          const quotedMessage =
            state.rooms[state.currentRoom]?.messages?.[quoteRef];

          const quote = quotedMessage
            ? {
                id: quoteRef,
                text: quotedMessage.text,
                senderName:
                  state.rooms[state.currentRoom]?.members?.[
                    quotedMessage.sender
                  ]?.name || state.me.name
              }
            : undefined;

          return {
            id,
            ...msg,
            quote,
            senderName:
              state.rooms[state.currentRoom]?.members?.[message.sender]?.name,
            senderImage:
              state.rooms[state.currentRoom]?.members?.[message.sender]?.image,
            timeline,
            continues: !timeline && arr[i - 1][1].isSend === message.isSend,
            rounded: isNextTimeline || arr[i + 1][1].isSend !== message.isSend
          };
        });
    },
    members: state => state.rooms[state.currentRoom]?.members,
    typingUsers: state =>
      state.typing.users.map(
        userId => state.rooms[state.currentRoom]?.members?.[userId]?.name
      )
  },
  mutations: {
    setMyInfo: (state, info) => {
      ({ id: state.me.id, name: state.me.name, image: state.me.image } = info);
    },
    setRooms: (state, rooms) => {
      for (const room of rooms) {
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
    },
    addMessage: (state, message) => {
      Vue.set(state.rooms[message.room].messages, message.id, {
        text: message.text,
        time: message.time,
        sender: message.sender,
        isSend: state.me.id === message.sender,
        edited: message.edited,
        quoteRef: message.quoteRef
      });

      state.lostMessages.delete(message.id);

      if (
        message.quoteRef &&
        !(message.quoteRef in state.rooms[message.room].messages)
      )
        state.lostMessages.add(message.quoteRef);
    },
    editMessage: (state, newMessage) => {
      if (
        newMessage.room in state.rooms &&
        state.rooms[newMessage.room].messages[newMessage.id]
      ) {
        state.rooms[newMessage.room].messages[newMessage.id].text =
          newMessage.text;
        state.rooms[newMessage.room].messages[newMessage.id].edited = true;
      }
    },
    deleteMessage: (state, id) => {
      Vue.delete(state.rooms[state.currentRoom].messages, id);
    },
    updateLastMessage: (state, message) => {
      if (
        new Date(state.rooms[message.room].lastMessage.time || 0) <
        new Date(message.time || 0)
      ) {
        state.rooms[message.room].lastMessage.text = message.text;
        state.rooms[message.room].lastMessage.time = message.time;
      }
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
      commit('setMyInfo', me);
    },
    onRooms: ({ getters, commit, dispatch }, rooms) => {
      commit('setRooms', rooms);
      dispatch('changeRoom', getters.rooms[0]?.id);
    },
    onMessage: ({ state, commit, dispatch }, message) => {
      if (message.room in state.rooms) {
        commit('addMessage', message);
        commit('updateLastMessage', message);
        commit('removeTyping', message.sender);
      }

      dispatch('handleLostMessages');
    },
    onEdit: ({ commit }, newMessage) => {
      commit('editMessage', newMessage);
    },
    onDelete: ({ commit }, id) => {
      commit('deleteMessage', id);
    },
    onTyping: ({ commit }, info) => {
      commit('addTyping', info);
    },
    getHistory: ({ state, getters, commit, dispatch }) => {
      return new Promise(res =>
        socket.emit(
          'getHistory',
          { room: state.currentRoom, offset: getters.messages.length },
          history => {
            if (history.room in state.rooms)
              history.messages.forEach(message =>
                commit('addMessage', { ...message, room: history.room })
              );

            res(history.messages);
            if (history.messages.length) dispatch('handleLostMessages');
          }
        )
      );
    },
    sendMessage: ({ state }, { message, quoteRef }) => {
      const text = message.trim();
      if (!text) return;

      socket.emit('sendMessage', {
        text,
        quoteRef,
        room: state.currentRoom
      });
    },
    editMessage: (context, { id, newText }) => {
      const text = newText.trim();
      if (!text) return false;

      socket.emit('sendEdit', id, text);
      return true;
    },
    deleteMessage: (context, id) => {
      socket.emit('sendDelete', id);
    },
    sendTyping: ({ state }) => {
      const now = Date.now();

      if (now - state.typing.lastSend > 2000) {
        state.typing.lastSend = now;
        socket.emit('sendTyping', state.currentRoom);
      }
    },
    handleLostMessages: ({ state, dispatch }) => {
      if (state.lostMessages.size) dispatch('getHistory');
    },
    changeRoom: ({ state, commit }, newRoomId) => {
      state.currentRoom = newRoomId;
      commit('removeTyping');
      // TODO save message in draft
    }
  }
};
