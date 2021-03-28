import Vue from 'vue';
import socket from '@/socket';

export default {
  state: {},
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
    messages: state => {
      if (!state.rooms[state.currentRoom]) return [];

      let isNextTimeline = true;
      const { messages } = state.rooms[state.currentRoom];

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
                senderName: state.members[quotedMessage.sender]?.name || ''
              }
            : undefined;

          const sender = state.members[message.sender] || {};

          return {
            id,
            ...msg,
            quote,
            senderName: sender.name,
            senderImage: sender.image,
            isSend: state.me === message.sender,
            timeline,
            continues: !timeline && arr[i - 1][1].sender === message.sender,
            rounded: isNextTimeline || arr[i + 1][1].sender !== message.sender
          };
        });
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
    handleLostMessages: ({ state, dispatch }, room) => {
      if (state.rooms[room]?.lostMessages?.size) dispatch('getHistory');
    }
  }
};
