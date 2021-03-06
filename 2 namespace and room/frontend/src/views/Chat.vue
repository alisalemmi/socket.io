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
    infinite-loading(
      direction='top',
      :identifier='currentRoom',
      spinner='spiral',
      @infinite='loadMessage'
    )
      span(slot='no-more')
      span(slot='no-results')
      span(slot='error')

    template(v-for='message in messages')
      .chat__timeline(v-if='message.timeline') {{ formatTime(message.time) }}

      message(
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
import infiniteLoading from 'vue-infinite-loading';
import { getDate } from '@/util/time';
import Room from '@/components/Room';
import Send from '@/components/Send';
import Message from '@/components/Message';

export default {
  name: 'Chat',
  components: { Room, Send, Message, infiniteLoading },
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
    loadMessage: async function (state) {
      if (!this.currentRoom) return;

      const messages = await this.getHistory();

      if (messages.length) state.loaded();
      else state.complete();
    },
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
    ...mapGetters('chat', ['rooms', 'messages', 'members', 'typingUsers']),
    formatTime: () => getDate
  },
  watch: {
    messages: function () {
      // this.scrollToEnd();
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

  &__timeline {
    display: flex;
    justify-content: center;

    position: sticky;
    top: 2rem;

    width: 8rem;
    margin: 1.5rem auto 0 auto;
    padding: 0.25rem 1rem;

    font-size: 1.2rem;
    border-radius: 10rem;
    background-color: adjust-color($color: $background-white-2, $alpha: 1);
  }
}
</style>
