<template lang="pug">
.chat
  ul.chat__room
    li.chat__room__box(v-for='(room, index) in rooms', :key='index')
      img.chat__room__image(
        src='https://www.gardenia.net/storage/app/public/guides/detail/UMiTBTJea8fOlL0ca396xU75ZmnS6HE4HqtkVJUN.jpeg'
      )
      h4.chat__room__title محمد
      span.chat__room__date 14:56
      p.chat__room__last خوبی؟ حالت چطوره؟

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
          svg.chat__message__status(@click='send')
            use(
              :xlink:href='`${require("@/assets/chatSprite.svg")}#double-tick-indicator`'
            )
          .chat__message__time {{ message.time }}

  form.chat__send
    #chat__send__message.chat__send__message(
      ref='chatSendMessage',
      contenteditable,
      autocapitalize='sentences',
      autocomplete='on',
      autocorrect='on',
      spellcheck,
      @input='message = $event.target.innerText',
      @keyup.ctrl.enter='send'
    )

    span.chat__send__label(
      @click='$refs.chatSendMessage.focus()',
      v-show='!message'
    ) پیام

    svg.chat__send__btn(@click='send')
      use(:xlink:href='`${require("@/assets/chatSprite.svg")}#send-button`')
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import store from '@/store';
import { io } from 'socket.io-client';
import VueSocketIOExt from 'vue-socket.io-extended';

Vue.use(VueSocketIOExt, io(), {
  store,
  actionPrefix: 'action',
  mutationPrefix: 'mutation',
  eventToMutationTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`,
  eventToActionTransformer: s => `${s[0].toUpperCase()}${s.slice(1)}`
});

export default {
  name: 'Chat',
  data: function () {
    return {
      message: ''
    };
  },
  methods: {
    send: function () {
      this.$socket.client.emit('send', { text: this.message });
      this.setMessage('');
    },
    setMessage: function (message) {
      this.message = message;
      this.$refs.chatSendMessage.innerText = message;
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
    $padding-tb: 2rem;
    $padding-lr: 1.5rem;
    $scroll-width: 0.75rem;

    grid-area: rooms;

    background-color: $background-white-2;
    list-style: none;
    direction: ltr; // go scroll bar right

    @include scrollbar($width: $scroll-width);

    @include respond(tab-port) {
      display: none;
    }

    &__box {
      display: grid;
      grid-template-columns: 5rem 1fr max-content;
      grid-template-areas:
        'image title date'
        'image last last';
      grid-gap: 0.5rem 1.5rem;

      direction: rtl; // go scroll bar right
      padding: $padding-tb $padding-lr;
      padding-right: max($padding-lr - $scroll-width, 0);

      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background-color: darken($color: $background-white, $amount: 8);
      }
    }

    &__image {
      display: block;
      width: 5rem;
      height: 5rem;
      grid-area: image;
      align-self: center;

      border-radius: 50%;
    }

    &__title {
      width: 100%;
      grid-area: title;

      font-weight: 400;
      font-size: 1.7rem;
      text-align: right;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    &__date {
      grid-area: date;
      justify-self: left;

      font-size: 1.3rem;
      color: $color-text-gray;
    }

    &__last {
      width: 100%;
      grid-area: last;

      font-size: 1.3rem;
      text-align: right;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  &__send {
    $send-icon-size: 3.5rem;
    $padding-message-tb: 1.7rem;
    $padding-message-lr: 2.5rem;
    $font-size: 1.5rem;
    $line-height: 1.5;

    position: relative;
    grid-area: send;
    margin: 1rem;

    &__message {
      padding: $padding-message-tb $padding-message-lr $padding-message-tb
        $padding-message-lr + $send-icon-size;
      width: 100%;
      max-height: 25vh;

      font-size: $font-size;
      line-height: $line-height;

      outline: none;
      border: none;
      cursor: text;
      overflow-y: auto;

      user-select: text;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      -webkit-user-modify: read-write-plaintext-only;

      @include round-box($background: #f1f1f1, $box-shadow: none);
      @include scrollbar();
    }

    &__label {
      position: absolute;
      top: 50%;
      right: 2.5rem;

      color: $color-text-gray-2;
      transform: translateY(-50%);
      transition: opacity 0.3s ease;

      cursor: text;
    }

    &__message:focus + &__label {
      opacity: 0;
    }

    &__btn {
      position: absolute;
      bottom: (
          $font-size * $line-height + 2 * $padding-message-tb - $send-icon-size
        ) / 2;
      left: $padding-message-lr / 2;
      width: $send-icon-size;
      height: $send-icon-size;
      padding: 0.75rem;

      cursor: pointer;
      border: none;
      outline: none;
      border-radius: 1rem;

      fill: #fff;
      background-color: $color-secondary;
      transition: all 0.3s ease;

      &:hover {
        border-radius: 1.25rem;
        padding: 0.5rem;
      }

      &:active {
        padding: 0.2rem;
        border-radius: 0.75rem;
        transition-duration: 0.1s;
      }
    }
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
