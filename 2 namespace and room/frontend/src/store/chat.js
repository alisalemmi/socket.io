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
    rooms: [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    messages: [{ text: 'سلام', time: formatTime(1612528380000) }]
  },
  getter: {},
  mutations: {
    mutationMessage: (state, message) => {
      state.messages.push({
        text: message.text,
        time: formatTime(message.time)
      });
    }
  },
  actions: {}
};
