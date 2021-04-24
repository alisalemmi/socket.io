import Vue from 'vue';
import socket from '@/socket';

export default {
  state: {
    lastSeen: 0,
    seenMessageNumber: 0
  },
  getters: {
    lastMessages: state => {
      const lastMessages = {};

      for (const id in state.rooms) {
        lastMessages[id] = Object.values(state.rooms[id].messages).reduce(
          (acc, cur) => (acc.time < cur.time ? cur : acc),
          { time: 0 }
        );
      }

      return lastMessages;
    },
    unreadMessages: state => {
      return Object.fromEntries(
        Object.entries(state.rooms).map(([id, room]) => {
          const lastSeen = room.members[state.me].lastSeenMessage;

          const unreadCount = Object.values(room.messages).reduce(
            (unread, message) =>
              message.time > lastSeen ? unread + 1 : unread,
            0
          );

          return [id, unreadCount];
        })
      );
    },
    messages: (state, { currentRoom }) => {
      if (!currentRoom?.messages) return [];

      let isNextTimeline = true;
      const { messages } = currentRoom;

      const sortedMessages = Object.entries({
        ...messages,
        unread: {
          time: state.lastSeen
        }
      })
        .sort(([, a], [, b]) => a?.time - b?.time)
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
        time: new Date(message.time).getTime(),
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
      const me = state.rooms[state.currentRoom].members[state.me];

      state.seenMessageNumber++;
      if (me.lastSeenMessage < time) me.lastSeenMessage = time;
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
    getHistory: ({ state, getters, commit, dispatch }, direction) => {
      let date = 0;

      if (Object.keys(getters.currentRoom.messages).length === 1)
        date = getters.meInCurrentRoom.lastSeenMessage;
      else
        date =
          getters.messages[direction ? 0 : getters.messages.length - 1]?.time ||
          0;

      return new Promise(res =>
        socket.emit(
          'getHistory',
          {
            room: state.currentRoom,
            direction,
            date
          },
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
    syncLastSeenMessage: ({ state, getters }) => {
      if (state.seenMessageNumber <= 0) return;
      state.seenMessageNumber = 0;

      socket.emit('syncLastSeenMessage', {
        room: state.currentRoom,
        lastSeenMessage: getters.meInCurrentRoom.lastSeenMessage
      });
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
