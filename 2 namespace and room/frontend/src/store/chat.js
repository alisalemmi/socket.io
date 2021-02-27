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
      name: '',
      image: ''
    },
    rooms: [],
    messages: []
  },
  getter: {},
  mutations: {
    mutateMessage: (state, message) => {
      state.messages.push({
        text: message.text,
        time: formatTime(message.time)
      });
    },
    mutateRooms: (state, rooms) => {
      for (const room of rooms) {
        room.name = room.members.map(member => member.name);
        room.image = room.members.map(member => member.image);
      }

      state.rooms = rooms;
    },
    mutateMe: (state, me) => {
      ({ name: state.me.name, image: state.me.image } = me);
    }
  },
  actions: {}
};
