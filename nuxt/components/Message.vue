<template lang="pug">
include ../assets/pug/icon

aside.message(
  :class='{ "message--send": flags.isSend, "message--first": flags.isFirst, "message--last": flags.isLast }',
  @contextmenu.prevent.stop='$emit("contextmenu", $event)'
)
  avatar.message__sender__image(
    v-if='flags.isFirst && !flags.isSend',
    :member='sender'
  )
  span.message__sender__name(v-if='flags.isFirst && !flags.isSend') {{ sender.name }}

  .message__body
    p.message__text {{ text }}

    .message__body__footer
      +icon('double-tick-indicator').message__icon
      +icon('edit').message__icon(v-if='edited')
      .message__time {{ time | getTime }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import type { IMember, IMessageFlags } from '@/@types';

import { getTime } from '@/util/time/getTime';

@Component({
  filters: {
    getTime
  }
})
export default class Message extends Vue {
  @Prop()
  readonly sender!: IMember;

  @Prop()
  readonly text!: string;

  @Prop()
  readonly time!: number;

  @Prop()
  readonly edited!: boolean;

  @Prop()
  readonly flags!: IMessageFlags;
}
</script>

<style lang="scss">
.message {
  display: grid;

  grid-template-columns: 44px auto;
  grid-template-areas:
    'sender-image sender-name'
    'sender-image body';

  grid-gap: 0 1.5rem;
  align-self: flex-start;
  max-width: 60%;

  &__sender {
    &__image {
      grid-area: sender-image;
    }

    &__name {
      grid-area: sender-name;

      font-size: 1.2rem;
      color: $color-text-gray;

      @include no-drag();
    }
  }

  &__body {
    grid-area: body;
    margin-top: 0.5rem;
    padding: 1rem 1rem 0.25rem 1rem;

    border-radius: 1rem 0 0 1rem;
    background-color: $color-white-3;
    box-shadow: $shadow-4;

    &__footer {
      display: flex;
      margin-top: 0.75rem;

      font-size: 1.2rem;
      color: $color-text-gray;
      fill: $color-text-gray;
    }
  }

  &__text {
    user-select: text;
    white-space: pre-wrap;
  }

  &__icon {
    width: 1.5rem;
    height: 1.5rem;
    margin-left: 0.5rem;
  }

  &__time {
    margin-right: auto;
    padding-right: 3rem;

    @include no-drag();
  }

  &--send {
    display: block;
    align-self: flex-end;

    #{parent(&)}__body {
      border-radius: 0 1rem 1rem 0;
    }
  }

  &--first {
    margin-top: $messageMarginTop;

    #{parent(&)}__body {
      border-top-right-radius: 0;
    }

    &#{parent(&)}--send {
      #{parent(&, 3)}__body {
        border-top-right-radius: 1rem;
        border-top-left-radius: 0;
      }
    }
  }

  &--last {
    #{parent(&)}__body {
      border-bottom-right-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }
  }
}
</style>
