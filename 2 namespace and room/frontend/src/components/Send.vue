<template lang="pug">
form.chat__send
  .chat__send__is-typing {{ typingMessage }}
    - let n = 1;
    while n < 4
      .chat__send__is-typing__dot(
        class=`chat__send__is-typing__dot--${n++}`,
        v-show='typingUsers.length'
      )

  .chat__send__message__box
    #chat__send__message.chat__send__message(
      ref='chatSendInput',
      contenteditable,
      autocapitalize='sentences',
      autocomplete='on',
      autocorrect='on',
      spellcheck,
      @input='$emit("input", $event.target.innerText)',
      @keyup.ctrl.enter='$emit("send")',
      @keyup='$emit("keypress")'
    )

    span.chat__send__label(
      @click='$refs.chatSendInput.focus()',
      v-show='!value'
    ) پیام

  svg.chat__send__btn(@click='$emit("send")')
    use(:xlink:href='`${require("@/assets/chatSprite.svg")}#send-button`')
</template>

<script>
export default {
  name: 'chatSend',
  props: ['value', 'typingUsers'],
  computed: {
    typingMessage: function () {
      if (!this.typingUsers.length) return '';

      const names =
        this.typingUsers.length < 3
          ? this.typingUsers.join(' و ')
          : `${this.typingUsers.length} نفر`;

      const verb = this.typingUsers.length === 1 ? 'است' : 'هستند';

      return `${names} در حال تایپ کردن ${verb}`;
    }
  },
  watch: {
    value: function (to) {
      if (this.$refs.chatSendInput.innerText !== to)
        this.$refs.chatSendInput.innerText = to;
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

    &__box {
      position: relative;
    }
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

  &__is-typing {
    $font-size: 1.2rem;

    display: flex;
    margin-bottom: 0.75rem;
    padding-right: $padding-message-lr;

    height: $font-size * 1.7;
    align-items: center;

    color: $color-text-gray;
    font-size: $font-size;

    &__dot {
      width: 0.75rem;
      height: 0.75rem;
      margin-right: 0.5rem;

      background-color: currentColor;
      border-radius: 50%;

      @for $i from 1 through 3 {
        @keyframes anim__chat__send__is-typing__dot--#{$i} {
          0% {
            transform: scale(1, 1);
          }

          25% {
            @if $i == 1 {
              transform: scale(1, 1.5);
            } @else {
              transform: scale(1, 1);
            }
          }

          50% {
            @if $i == 2 {
              transform: scale(1, 1.5);
            } @else {
              transform: scale(1, 0.67);
            }
          }

          75% {
            @if $i == 3 {
              transform: scale(1, 1.5);
            } @else {
              transform: scale(1, 1);
            }
          }

          100% {
            transform: scale(1, 1);
          }
        }

        &--#{$i} {
          animation: anim__chat__send__is-typing__dot--#{$i} 1s linear infinite;
        }
      }
    }
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
