<template lang="pug">
include ../assets/pug/icon

form.send(:class='{ "send--close": !show }', @submit.prevent)
  .send__is-typing {{ typingUsersMessage }}
    - let n = 1;
    while n < 4
      .send__is-typing__dot(
        class=`send__is-typing__dot--${n++}`,
        v-show='typingUsers.length'
      )
    .send__is-typing__dot.send__is-typing__dot--moving(
      v-show='typingUsers.length'
    )

  .send__message__box
    .send__info(v-show='state === "edit" || state === "quote"')
      +icon('state === "edit" ? "edit" : state === "quote" ? "reply-message" : ""').send__info__icon
      .send__info__state {{ state === "edit" ? "ویرایش" : state === "quote" ? "نقل قول" : "" }}
      .send__info__close(@click='$emit("cancel")')
      .send__info__text {{ selectedMessage.text }}

    #send__message.send__message(
      ref='sendInput',
      contenteditable,
      autocapitalize='sentences',
      autocomplete='on',
      autocorrect='on',
      spellcheck,
      @input='$emit("input", $event.target.innerText)',
      @keydown.delete='!messageText && $emit("cancel")',
      @keyup.ctrl.enter='$emit("submit")'
    )

    span.send__label(@click='focus', v-show='!messageText') پیام

  vs-button.send__button(
    flat,
    icon,
    active,
    color='secondary',
    @click='$emit("submit")'
  )
    +icon('send-button')
</template>

<script lang="ts">
import {
  VModel,
  Prop,
  Ref,
  Watch,
  Component,
  Vue
} from 'vue-property-decorator';

import type { IMessage, typingUsersGetter } from '@/@types';

export enum sendState {
  Send,
  Edit,
  Quote
}

@Component
export default class Send extends Vue {
  @VModel()
  readonly messageText!: string;

  @Prop()
  readonly state!: sendState;

  @Prop()
  readonly selectedMessage!: IMessage;

  @Prop()
  readonly typingUsers!: typingUsersGetter;

  @Prop()
  readonly show!: boolean;

  @Ref()
  readonly sendInput!: HTMLInputElement;

  mounted() {
    this.$root.$on('escape', () => this.$emit('cancel'));
  }

  get typingUsersMessage() {
    if (!this.typingUsers.length) return '';

    const names =
      this.typingUsers.length < 3
        ? this.typingUsers.join(' و ')
        : `${this.typingUsers.length} نفر`;

    const verb = this.typingUsers.length === 1 ? 'است' : 'هستند';

    return `${names} در حال تایپ کردن ${verb}`;
  }

  focus() {
    this.sendInput.focus();
  }

  @Watch('value')
  onTyping(to: string, from: string) {
    // messageText wasn't changed by typing
    if (this.sendInput.innerText !== to) this.sendInput.innerText = to;
    else if (
      to.length > from.length &&
      (this.state === sendState.Send || this.state === sendState.Quote)
    )
      this.$emit('type');
  }
}
</script>

<style lang="scss">
$margin: 1.5rem;
$padding-message-tb: 1.7rem;
$padding-message-lr: 2.5rem;
$font-size: 1.5rem;
$line-height: 1.5;
$send-icon-size: 3.5rem;

.send {
  position: relative;

  transition: all $selectRoomDuration ease;

  &--close {
    transform: translateY(100%);
    opacity: 0;
  }

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
      margin: $margin;

      overflow: hidden;

      @include round-box($background: $color-white-5, $box-shadow: $shadow-3);
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
        @keyframes anim__send__is-typing__dot--#{$i} {
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
          animation: anim__send__is-typing__dot--#{$i} 1s linear infinite;
        }
      }

      &--moving {
        @keyframes anim__send__is-typing__dot--moving {
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
        animation: anim__send__is-typing__dot--moving 1s linear infinite;
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
    background-color: $color-white-7;

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

  &__button {
    margin: 0;
    padding: 0.75rem;
    width: $send-icon-size;
    height: $send-icon-size;

    position: absolute;
    bottom: (
        $font-size * $line-height + 2 * $padding-message-tb - $send-icon-size
      ) / 2 + $margin;
    left: $padding-message-lr / 2 + $margin;

    border-radius: 1rem;

    & > div {
      padding: 0 !important;
    }

    &:hover {
      border-radius: 1.25rem;
      padding: 0.6rem;
    }

    &:active {
      padding: 0.2rem;
      border-radius: 0.75rem;
      transition-duration: 0.1s;
    }
  }
}
</style>
