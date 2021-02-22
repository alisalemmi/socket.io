<template lang="pug">
.chat
  ul.chat__room__box

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
      use(:xlink:href='`${require("@/assets/chatSprite.svg")}#send`')
</template>

// TODO dir?
<script>
export default {
  name: 'Chat',
  data: function () {
    return {
      message: ''
    };
  },
  methods: {
    send: function () {
      this.setMessage('');
    },
    setMessage: function (message) {
      this.message = message;
      this.$refs.chatSendMessage.innerText = message;
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

  background-color: $color-light-green;

  @include no-drag();

  &__room {
    &__box {
      grid-area: rooms;
      background-color: $color-red;
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

      font-size: $font-size;
      line-height: $line-height;

      outline: none;
      border: none;
      cursor: text;

      user-select: text;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      -webkit-user-modify: read-write-plaintext-only;

      @include round-box();
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
}
</style>
