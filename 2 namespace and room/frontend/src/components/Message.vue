<template lang="pug">
include ../pug/icon

.chat__message__box(
  :class='{ "chat__message__box--send": isSend, "chat__message__box--continue": continues }',
  @contextmenu='$emit("contextmenu", $event)'
)
  img.chat__message__image(v-if='!isSend && !continues', :src='senderImage')
  .chat__message__name(v-if='!isSend && !continues') {{ senderName }}
  .chat__message__body(:class='{ "chat__message__body--rounded": rounded }')
    .chat__message__quote(
      v-if='quote',
      @click='$emit("quoteClicked", quote.id)'
    )
      span {{ quote.senderName }}
      p.chat__message__quote__text {{ quote.text }}
    p.chat__message__text {{ text }}
    .chat__message__footer
      +icon('double-tick-indicator').chat__message__status
      +icon('edit').chat__message__status(v-if='edited')
      .chat__message__time {{ getTime }}
</template>

<script>
import { getTime } from '@/util/time';

export default {
  name: 'chatMessage',
  props: [
    'isSend',
    'senderName',
    'senderImage',
    'text',
    'time',
    'edited',
    'quote',
    'continues',
    'rounded'
  ],
  computed: {
    getTime: function () {
      return getTime(this.time);
    }
  }
};
</script>

<style lang="scss">
.chat__message {
  display: flex;
  flex-direction: column;

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

    &--continue {
      margin-top: -0.25rem;
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

    border-radius: 1rem 0 0 1rem;
    background-color: darken($color: $background-white-2, $amount: 5);

    &--rounded {
      border-radius: 1rem 0 1rem 1rem;
    }
  }

  &__quote {
    $font-size: 1.3rem;
    $line-number: 5;

    padding-right: 1rem;
    border-right: 0.25rem solid currentColor;

    font-size: $font-size;
    color: $color-text-gray-2;
    cursor: pointer;

    &__text {
      display: block;
      display: -webkit-box;
      max-height: $line-number * $font-size * 1.7;
      margin: 0.5rem auto;

      -webkit-line-clamp: $line-number;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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
    margin-left: 0.5rem;

    fill: currentColor;
  }

  &__time {
    margin-right: auto;
    padding-right: 3rem;

    font-size: 1.2rem;
  }

  &__box--send {
    grid-template-columns: auto;
    margin-right: auto;

    .chat__message {
      &__body {
        background-color: lighten($color: $color-primary, $amount: 60);
        border-radius: 0 1rem 1rem 0;

        &--rounded {
          border-radius: 0 1rem 1rem 1rem;
        }
      }
    }
  }
}
</style>
