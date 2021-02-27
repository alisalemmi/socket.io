<template lang="pug">
.chat
  ul.chat__room
    room(
      v-for='(room, index) in rooms',
      :key='index',
      :name='room.name.join("، ")',
      :image='`/image/${room.image}`',
      lastTime='8:49',
      lastMessage='خوبی؟ حالت چطوره؟'
    )

  .chat__message
    .chat__message__box.chat__message__box--continue(
      v-for='(message, index) in messages',
      :key='index'
    )
      img.chat__message__image(
        src='https://www.gardenia.net/storage/app/public/guides/detail/UMiTBTJea8fOlL0ca396xU75ZmnS6HE4HqtkVJUN.jpeg'
      )
      .chat__message__name علی سالمی
      .chat__message__body
        p.chat__message__text {{ message.text }}
        .chat__message__footer
          svg.chat__message__status
            use(
              :xlink:href='`${require("@/assets/chatSprite.svg")}#double-tick-indicator`'
            )
          .chat__message__time {{ message.time }}

  send(v-model='message', @send='send')
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import store from '@/store';
import { io } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';
import Room from '@/components/Room';
import Send from '@/components/Send';

Vue.use(VueSocketIOExt, io(), {
  store,
  actionPrefix: 'action',
  mutationPrefix: 'mutate',
  eventToMutationTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`,
  eventToActionTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`
});

export default {
  name: 'Chat',
  components: { Room, Send },
  data: function () {
    return {
      message: ''
    };
  },
  methods: {
    send: function () {
      this.$socket.client.emit('send', { text: this.message });
      this.message = '';
    }
  },
  computed: {
    ...mapState('chat', ['rooms', 'messages'])
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

    @include scrollbar();

    &__box {
      display: grid;
      max-width: 60%;
      grid-template-columns: 4rem auto;
      grid-template-areas:
        'image name'
        'image body';
      justify-content: right;
      grid-gap: 0.5rem 1.5rem;
      margin-top: 1.5rem;

      &--contine {
        margin-top: 0.5rem;
      }
    }

    &__image {
      display: block;
      width: 4rem;
      height: 4rem;
      grid-area: image;

      border-radius: 50%;
      cursor: pointer;
    }

    &__name {
      grid-area: name;

      font-size: 1.2rem;
      color: $color-text-gray;
    }

    &__body {
      grid-area: body;
      padding: 1rem 1rem 0.25rem 1rem;

      border-radius: 1rem 0 1rem 1rem;
      background-color: darken($color: $background-white-2, $amount: 5);
    }

    &__text {
      user-select: text;
      white-space: pre-wrap;
    }

    &__footer {
      display: flex;
      margin-top: 1rem;
      color: $color-text-gray;
    }

    &__status {
      width: 1.5rem;
      height: 1.5rem;

      fill: currentColor;
    }

    &__time {
      margin-right: auto;
      padding-right: 3rem;

      font-size: 1.2rem;
    }
  }
}
</style>
