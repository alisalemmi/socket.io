import Vue from 'vue';
import socket from '@/socket';

export default {
  state: {
    lastSeenMessage: new Date(0),
    seenMessageNumber: 0
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
    messages: (state, { currentRoom, meInCurrentRoom }) => {
      if (!currentRoom?.messages) return [];

      let isNextTimeline = true;
      const { messages } = currentRoom;

      const sortedMessages = Object.entries({
        ...messages,
        unread: {
          time: meInCurrentRoom.lastSeenMessage
        }
      })
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
                senderName: state.members[quotedMessage.sender]?.name || ''
              }
            : undefined;

          const sender = state.members[message.sender] || {};

          return id === 'unread'
            ? {
                id: 'unread',
                n: arr.length - i - 1
              }
            : {
                id,
                ...msg,
                quote,
                senderName: sender.name,
                senderImage: sender.image,
                isSend: state.me === message.sender,
                timeline,
                continues: !timeline && arr[i - 1][1].sender === message.sender,
                rounded:
                  isNextTimeline || arr[i + 1][1].sender !== message.sender
              };
        });

      if (sortedMessages[sortedMessages.length - 1].id === 'unread')
        sortedMessages.pop();

      return sortedMessages;
    }
  },
  mutations: {
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
    setLastSeenMessage: (state, time) => {
      const t = new Date(time);

      if (state.lastSeenMessage < t) {
        state.lastSeenMessage = t;
        state.seenMessageNumber++;
      }
    },
    resetLastSeenMessage: (state, time) => {
      state.lastSeenMessage = new Date(time);
      state.seenMessageNumber = 0;
    }
  },
  actions: {
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
    syncLastSeenMessage: ({ state }) => {
      if (state.seenMessageNumber <= 0) return;

      socket.emit('syncLastSeenMessage', {
        room: state.currentRoom,
        lastSeenMessage: state.lastSeenMessage
      });

      state.seenMessageNumber = 0;
    },
    handleLostMessages: ({ state, dispatch }, room) => {
      if (state.rooms[room]?.lostMessages?.size) dispatch('getHistory');
    },
    readMessage: ({ state, getters, commit, dispatch }, id) => {
      const message = getters.currentRoom.messages[id];

      if (message.time) commit('setLastSeenMessage', message.time);
      if (state.seenMessageNumber > 5) dispatch('syncLastSeenMessage');
    }
  }
};
