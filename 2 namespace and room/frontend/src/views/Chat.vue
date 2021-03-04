<template lang="pug">
.chat
  transition-group.chat__room(tag='ul')
    room(
      v-for='room in rooms',
      :key='room.id',
      :name='room.name.join("، ")',
      :image='`/image/${room.image[0]}`',
      :lastMessage='room.lastMessage.text',
      :lastTime='room.lastMessage.time',
      :select='room.id === currentRoom',
      @click='changeRoom(room.id)'
    )

  .chat__message
    message(
      v-for='message in messages',
      :key='message.id',
      :isSend='message.isSend',
      :senderName='message.senderName',
      :senderImage='`/image/${message.senderImage}`',
      :text='message.text',
      :time='message.time',
      :continues='message.continues',
      :rounded='message.rounded'
    )

  send(
    v-model='message',
    :typingUsers='typingUsers',
    @send='send',
    @typing='sendTyping'
  )
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import Room from '@/components/Room';
import Send from '@/components/Send';
import Message from '@/components/Message';

export default {
  name: 'Chat',
  components: { Room, Send, Message },
  data: function () {
    return {
      message: ''
    };
  },
  methods: {
    ...mapActions('chat', [
      'sendMessage',
      'sendTyping',
      'getHistory',
      'changeRoom'
    ]),
    send: function () {
      this.sendMessage(this.message);
      this.message = '';
    },
    scrollToEnd: function () {
      this.$nextTick(() => {
        if (this.$el.children[1] && this.$el.children[1].lastChild)
          this.$el.children[1].lastChild.scrollIntoView({ behavior: 'smooth' });
      });
    }
  },
  computed: {
    ...mapState('chat', ['currentRoom']),
    ...mapGetters('chat', ['rooms', 'messages', 'members', 'typingUsers'])
  },
  watch: {
    messages: function () {
      this.scrollToEnd();
    }
  },
  created: function () {
    setTimeout(() => this.getHistory(), 500);
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
