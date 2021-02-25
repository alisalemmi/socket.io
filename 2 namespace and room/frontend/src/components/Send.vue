<template lang="pug">
form.chat__send
  #chat__send__message.chat__send__message(
    contenteditable,
    autocapitalize='sentences',
    autocomplete='on',
    autocorrect='on',
    spellcheck,
    @input='$emit("input", $event.target.innerText)',
    @keyup.ctrl.enter='$emit("send")'
  )

  span.chat__send__label(@click='$el.firstChild.focus()', v-show='!value') پیام

  svg.chat__send__btn(@click='$emit("send")')
    use(:xlink:href='`${require("@/assets/chatSprite.svg")}#send-button`')
</template>

<script>
export default {
  name: 'chatSend',
  props: ['value'],
  watch: {
    value: function (to) {
      if (this.$el.firstChild.innerText !== to)
        this.$el.firstChild.innerText = to;
    }
  }
};
</script>

<style lang="scss">
.chat__send {
  $send-icon-size: 3.5rem;
  $padding-message-tb: 1.7rem;
  $padding-message-lr: 2.5rem;
  $font-size: 1.5rem;
  $line-height: 1.5;

  position: relative;

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
</style>
