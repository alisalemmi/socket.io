<template lang="pug">
include ../assets/pug/icon

aside.message
  avatar.message__sender__image(:member='sender')

  span.message__sender__name {{ sender.name }}

  .message__body
    p.message__text {{ text }}

    .message__body__footer
      +icon('double-tick-indicator').message__icon
      +icon('edit').message__icon
      .message__time {{ time | getTime }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import type { IMemberGetter } from '@/@types';

import { getTime } from '@/util/time/getTime';

@Component({
  filters: {
    getTime
  }
})
export default class Message extends Vue {
  @Prop()
  private text!: string;

  @Prop()
  private time!: number;

  @Prop()
  private sender!: IMemberGetter;
}
</script>

<style lang="scss">
.message {
  display: grid;

  grid-template-columns: min-content auto;
  grid-template-areas:
    'sender-image sender-name'
    'sender-image body';

  grid-gap: 0.5rem 1.5rem;
  justify-content: right;
  max-width: 60%;

  margin-top: 1.5rem;

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
    padding: 1rem 1rem 0.25rem 1rem;

    border-radius: 1rem 0 1rem 1rem;
    background-color: $color-white;
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
}
</style>
