<template lang="pug">
include ../pug/icon

form.chat__send
  .chat__send__is-typing {{ typingMessage }}
    - let n = 1;
    while n < 4
      .chat__send__is-typing__dot(
        class=`chat__send__is-typing__dot--${n++}`,
        v-show='typingUsers.length'
      )
    .chat__send__is-typing__dot.chat__send__is-typing__dot--moving(
      v-show='typingUsers.length'
    )

  .chat__send__message__box
    .chat__send__info(v-show='state === "edit" || state === "quote"')
      +icon('state === "edit" ? "edit" : state === "quote" ? "reply-message" : ""').chat__send__info__icon
      .chat__send__info__state {{ state === "edit" ? "ویرایش" : state === "quote" ? "نقل قول" : "" }}
      .chat__send__info__close(@click='$emit("cancel")')
      .chat__send__info__text {{ selectedMessage.text }}

    #chat__send__message.chat__send__message(
      ref='chatSendInput',
      contenteditable,
      autocapitalize='sentences',
      autocomplete='on',
      autocorrect='on',
      spellcheck,
      @input='$emit("input", $event.target.innerText)',
      @keydown.delete='!value && $emit("cancel")',
      @keyup.ctrl.enter='$emit("submit")'
    )

    span.chat__send__label(
      @click='$refs.chatSendInput.focus()',
      v-show='!value'
    ) پیام

  +icon('send-button').chat__send__btn(@click='$emit("submit")')
</template>

<script>
export default {
  name: 'chatSend',
  props: {
    value: {
      type: String
    },
    state: {
      type: String,
      default: 'send'
    },
    selectedMessage: {
      type: Object
    },
    typingUsers: {
      type: Array
    }
  },
  methods: {
    focus: function () {
      this.$refs.chatSendInput.focus();
    }
  },
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
    value: function (to, from) {
      if (this.$refs.chatSendInput.innerText !== to)
        this.$refs.chatSendInput.innerText = to;

      // detect type
      if (to.length > from.length) this.$emit('typing');
    }
  },
  mounted() {
    this.$root.$on('escape', () => this.$emit('cancel'));
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
  $background: #f1f1f1;

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

    @include scrollbar();

    &__box {
      position: relative;
      overflow: hidden;

      @include round-box($background: $background, $box-shadow: none);
    }
  }

  &__label {
    position: absolute;
    bottom: $padding-message-tb;
    right: 2.5rem;

    color: $color-text-gray-2;
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
      $dot-size: 0.75rem;
      $dot-margin: 0.4rem;

      width: $dot-size;
      height: $dot-size;
      margin-right: $dot-margin;

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

      &--moving {
        @keyframes anim__chat__send__is-typing__dot--moving {
          0%,
          25% {
            transform: translateX(3 * $dot-size + 2 * $dot-margin);
          }

          75%,
          100% {
            transform: translateX($dot-size);
          }
        }

        margin-right: 0;
        animation: anim__chat__send__is-typing__dot--moving 1s linear infinite;
      }
    }
  }

  &__info {
    $icon-size: 2.5rem;
    $close-size: 2rem;

    display: grid;
    grid-template-columns: $icon-size 1fr $close-size;
    grid-template-areas:
      'icon state close'
      'icon text text';
    grid-gap: 0.5rem 1.5rem;

    margin: 1rem 1rem 0 1rem;
    padding: 1rem;

    border-radius: 1rem;
    background-color: darken($background, 5%);

    &__icon {
      width: $icon-size;
      height: $icon-size;
      grid-area: icon;

      fill: $color-text;
    }

    &__state {
      grid-area: state;
    }

    &__text {
      grid-area: text;
      max-height: 12rem;

      font-size: 1.3rem;
      user-select: text;
      white-space: pre-wrap;

      @include scrollbar();
    }

    &__close {
      grid-area: close;
      position: relative;
      cursor: pointer;

      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: $close-size;
        height: 1px;

        background-color: currentColor;
        transition: all 0.5s ease;
      }

      &::before {
        transform: rotate(45deg);
      }

      &::after {
        transform: rotate(-45deg);
      }

      &:hover {
        color: $color-secondary;
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
