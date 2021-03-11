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
    lastMessages: state => {
      const lastMessages = {};

      for (const id in state.rooms) {
        lastMessages[id] = Object.values(state.rooms[id].messages).reduce(
          (acc, cur) =>
            new Date(acc.time || 0) < new Date(cur.time || 0) ? cur : acc,
          {}
        );
      }

      return lastMessages;
    },
    rooms: (state, getters) => {
      return Object.entries(state.rooms)
        .sort(
          ([a], [b]) =>
            new Date(getters.lastMessages[b].time || 0) -
            new Date(getters.lastMessages[a].time || 0)
        )
        .map(([id, room]) => {
          const members = Object.values(room.members);

          return {
            id,
            lastMessage: getters.lastMessages[id],
            name: members.map(m => m.name),
            image: members.map(m => m.image)
          };
        });
    },
    messages: state => {
      if (!state.rooms[state.currentRoom]) return [];

      let isNextTimeline = true;
      const { messages, members } = state.rooms[state.currentRoom];

      if (!messages) return [];

      return Object.entries(messages)
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
          const quotedMessage = messages[quoteRef];

          const quote = quotedMessage
            ? {
                id: quoteRef,
                text: quotedMessage.text,
                senderName:
                  members?.[quotedMessage.sender]?.name || state.me.name
              }
            : undefined;

          return {
            id,
            ...msg,
            quote,
            senderName: members?.[message.sender]?.name,
            senderImage: members?.[message.sender]?.image,
            isSend: state.me.id === message.sender,
            timeline,
            continues: !timeline && arr[i - 1][1].sender === message.sender,
            rounded: isNextTimeline || arr[i + 1][1].sender !== message.sender
          };
        });
    },
    members: state => state.rooms[state.currentRoom]?.members,
    typingUsers: state =>
      state.typing.users
        .map(userId => state.rooms[state.currentRoom]?.members?.[userId]?.name)
        .filter(name => name)
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
          lostMessages: new Set()
        });

        // set all info of last message except quoteRef
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
        // set members
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
      const room = state.rooms[message.room];

      if (!room) return;

      Vue.set(room.messages, message.id, {
        text: message.text,
        time: message.time,
        sender: message.sender,
        edited: message.edited,
        quoteRef: message.quoteRef
      });

      room.lostMessages.delete(message.id);

      if (message.quoteRef && !(message.quoteRef in room.messages))
        room.lostMessages.add(message.quoteRef);
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
    deleteMessage: (state, message) => {
      Vue.delete(state.rooms[message.room].messages, message.id);
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
        commit('removeTyping', message.sender);
      }

      dispatch('handleLostMessages', message.room);
    },
    onEdit: ({ commit }, newMessage) => {
      commit('editMessage', newMessage);
    },
    onDelete: ({ commit }, message) => {
      commit('deleteMessage', message);
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

            if (history.messages.length)
              dispatch('handleLostMessages', history.room);
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
    handleLostMessages: ({ state, dispatch }, room) => {
      if (state.rooms[room]?.lostMessages?.size) dispatch('getHistory');
    },
    changeRoom: ({ state, commit }, newRoomId) => {
      state.currentRoom = newRoomId;
      commit('removeTyping');
      // TODO save message in draft
    }
  }
};
