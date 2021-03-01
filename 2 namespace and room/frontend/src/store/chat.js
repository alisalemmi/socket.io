import Vue from 'vue';

/**
 * give time in the form of `HH:mm` (24 hours, 2 digit numbers).
 * if given `time` is not a valid Date, return `Date.now()`
 * @param {number} time number
 */
const formatTime = time => {
  let t = new Date(time);
  if (isNaN(t)) t = new Date();

  return t.toLocaleTimeString('fa', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default {
  namespaced: true,
  state: {
    me: {
      id: '',
      name: '',
      image: ''
    },
    rooms: [],
    currentRoom: '',
    messages: {},
    typingUsers: []
  },
  getters: {
    messages: state => state.messages[state.currentRoom],
    members: state =>
      state.rooms.filter(room => room.id === state.currentRoom)[0].members,
    typingUsers: state => state.typingUsers.map(t => t.userId)
  },
  mutations: {
    mutateMe: (state, me) => {
      ({ id: state.me.id, name: state.me.name, image: state.me.image } = me);
    },
    mutateRooms: (state, rooms) => {
      state.rooms = [];

      for (const room of rooms) {
        Vue.set(state.messages, room.id, []);

        const r = {
          id: room.id,
          name: room.members.map(member => member.name),
          image: room.members.map(member => member.image),
          members: {}
        };

        for (const member of room.members) {
          r.members[member._id] = {
            name: member.name,
            image: member.image,
            lastSeen: member.lastSeen
          };
        }

        state.rooms.push(r);
      }

      if (rooms.length) state.currentRoom = rooms[0].id;
    },
    changeRoom: (state, newRoomId) => {
      state.currentRoom = newRoomId;
      state.typingUsers = [];
    },
    mutateMessage: (state, message) => {
      // remove isTyping
      state.typingUsers = state.typingUsers.filter(
        t => t.userId !== message.sender
      );

      state.messages[message.room].push({
        text: message.text,
        time: formatTime(message.time),
        sender: message.sender,
        isSend: state.me.id === message.sender
      });
    },
    mutateTyping: (state, info) => {
      if (info.room !== state.currentRoom) return;

      const preTyping = state.typingUsers.find(t => t.userId === info.userId);

      const timer = setTimeout(() => {
        state.typingUsers = state.typingUsers.filter(
          t => t.userId !== info.userId
        );
      }, info.expires);

      if (preTyping) {
        clearTimeout(preTyping.timer);
        preTyping.timer = timer;
      } else {
        state.typingUsers.push({
          userId: info.userId,
          timer
        });
      }
    }
  },
  actions: {}
};
