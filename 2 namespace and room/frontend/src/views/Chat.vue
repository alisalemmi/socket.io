<template lang="pug">
.chat
  ul.chat__room
    room(
      v-for='room in rooms',
      :key='room.id',
      :name='room.name.join("، ")',
      :image='`/image/${room.image}`',
      lastTime='8:49',
      lastMessage='خوبی؟ حالت چطوره؟',
      :select='room.id === currentRoom',
      @click='changeRoom(room.id)'
    )

  .chat__message
    message(
      v-for='(message, index) in messages',
      :key='index',
      :isSend='message.isSend',
      :senderName='!message.isSend && members[message.sender].name',
      :senderImage='!message.isSend && `/image/${members[message.sender].image}`',
      :text='message.text',
      :time='message.time',
      :continues='messages[index - 1] && message.sender === messages[index - 1].sender'
    )

  send(
    v-model='message',
    :typingUsers='typingUsers.map(t => members[t].name)',
    @send='send',
    @keypress='type'
  )
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters, mapMutations } from 'vuex';
import store from '@/store';
import { io } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import Room from '@/components/Room';
import Send from '@/components/Send';
import Message from '@/components/Message';

Vue.use(VueSocketIOExt, io(), {
  store,
  actionPrefix: 'action',
  mutationPrefix: 'mutate',
  eventToMutationTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`,
  eventToActionTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`
});

export default {
  name: 'Chat',
  components: { Room, Send, Message },
  data: function () {
    return {
      message: '',
      lastSendTyping: Date.now()
    };
  },
  methods: {
    ...mapMutations('chat', ['changeRoom']),
    send: function () {
      if (!this.message.trim()) return;

      this.$socket.client.emit('send', {
        text: this.message,
        room: this.currentRoom
      });

      this.message = '';
    },
    type: function () {
      if (this.message && Date.now() - this.lastSendTyping > 2000) {
        this.lastSendTyping = Date.now();
        this.$socket.client.emit('iAmTyping', this.currentRoom);
      }
    },
    scrollToEnd: function () {
      this.$nextTick(() => {
        if (this.$el.children[1] && this.$el.children[1].lastChild)
          this.$el.children[1].lastChild.scrollIntoView({ behavior: 'smooth' });
      });
    }
  },
  computed: {
    ...mapState('chat', ['rooms', 'currentRoom']),
    ...mapGetters('chat', ['messages', 'members', 'typingUsers'])
  },
  watch: {
    messages: function () {
      this.scrollToEnd();
    }
  }
};
</script>

<style lang="scss">
.chat {
  display: grid;
  grid-template-columns: minmax(30%, 30rem) 1fr;
  grid-template-rows: 1fr min-content;
  grid-template-areas:
    'rooms chats'
    'rooms send';

  height: 100%;

  @include no-drag();

  @include respond(tab-port) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      'chats'
      'send';
  }

  &__room {
    grid-area: rooms;

    @include respond(tab-port) {
      display: none;
    }
  }

  &__send {
    grid-area: send;
    margin: 1rem;
  }

  &__message {
    padding: 0 2rem;
    grid-area: chats;
  }
}
</style>
