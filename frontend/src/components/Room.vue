<template lang="pug">
li.chat__room__box(
  :class='{ "chat__room__box--select": select }',
  @click='$emit("click", $event)'
)
  .chat__room__image__box
    template(v-for='(member, index) in firstMembers')
      img.chat__room__image(
        v-if='isNaN(member)',
        :key='index',
        :class='`chat__room__image--${firstMembers.length}-${index}`',
        :src='`/image/${member.image}`',
        :alt='member.name',
        :title='member.name'
      )
      .chat__room__image.chat__room__image--more(
        v-else,
        :key='index',
        :class='`chat__room__image--${firstMembers.length}-${index}`'
      ) +{{ member }}

    .chat__room__status(
      v-if='firstMembers.length === 1',
      v-show='firstMembers[0].lastSeen === "online"'
    )

  h4.chat__room__title(:title='name') {{ name }}
  span.chat__room__date {{ getLastTime }}
  p.chat__room__last {{ lastMessage }}
  .chat__room__unread(v-if='unreadMessages') {{ unreadMessages >= 100 ? "+99" : unreadMessages }}
</template>

<script>
import { getDate } from '@/util/time';

export default {
  name: 'chatRoom',
  props: ['members', 'lastTime', 'lastMessage', 'unreadMessages', 'select'],
  computed: {
    name: function () {
      const names = Object.values(this.members).map(member => member.name);
      const lastName = names.pop();

      return names.length ? `${names.join('، ')} و ${lastName}` : lastName;
    },
    firstMembers: function () {
      const members = Object.values(this.members);
      const firstMembers = members.slice(0, members.length === 4 ? 4 : 3);

      if (members.length - firstMembers.length)
        firstMembers.push(members.length - firstMembers.length);

      return firstMembers;
    },
    getLastTime: function () {
      return getDate(this.lastTime, true);
    }
  }
};
</script>

<style lang="scss">
.chat__room {
  $padding-tb: 2rem;
  $padding-lr: 1.5rem;
  $image-size: 5rem;
  $scroll-width: 0.75rem;

  background-color: $background-white-2;
  list-style: none;

  @include scrollbar($width: $scroll-width, $force-right: true);

  &__box {
    display: grid;
    grid-template-columns: $image-size 1fr max-content;
    grid-template-areas:
      'image title date date'
      'image last last unread';
    grid-gap: 0.5rem 1.5rem;

    padding: $padding-tb $padding-lr;
    padding-right: max($padding-lr - $scroll-width, 0);

    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: darken($color: $background-white, $amount: 8);
    }

    &--select {
      background-color: darken($color: $background-white, $amount: 10);
    }
  }

  &__image {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;

    border-radius: 50%;
    border: 1px solid #fff;
    background-color: #fff;

    &--more {
      display: flex;
      direction: ltr;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      border: none;
    }

    &__box {
      position: relative;
      width: $image-size;
      height: $image-size;
      grid-area: image;
    }

    &--1-0 {
      position: static;
      border: none;
    }

    $pos: (
      (),
      (
        (
          top: 0,
          left: 0
        ),
        (
          bottom: 0,
          right: 0
        )
      ),
      (
        (
          top: 0,
          left: 0
        ),
        (
          top: 0,
          right: 0
        ),
        (
          bottom: 0,
          left: 25%
        )
      ),
      (
        (
          top: 0,
          left: 0
        ),
        (
          top: 0,
          right: 0
        ),
        (
          bottom: 0,
          left: 0
        ),
        (
          bottom: 0,
          right: 0
        )
      )
    );

    @for $i from 2 through list.length($pos) {
      &%chat__room__image--#{$i} {
        width: 80% - 5 * $i;
        height: 80% - 5 * $i;
      }

      &--#{$i} {
        @for $j from 0 to list.length(list.nth($pos, $i)) {
          &-#{$j} {
            @extend %chat__room__image--#{$i};

            top: map.get(list.nth(list.nth($pos, $i), $j + 1), top);
            right: map.get(list.nth(list.nth($pos, $i), $j + 1), right);
            bottom: map.get(list.nth(list.nth($pos, $i), $j + 1), bottom);
            left: map.get(list.nth(list.nth($pos, $i), $j + 1), left);
            z-index: $j;
          }
        }
      }
    }
  }

  &__status {
    position: absolute;
    width: 1.6rem;
    height: 1.6rem;
    bottom: $image-size / 2 * (1- 1 / math.sqrt(2));
    left: $image-size / 2 * (1- 1 / math.sqrt(2));
    transform: translate(-50%, 50%);

    border-radius: 50%;
    border: 2px solid #fff;
    background-color: $color-green;
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

  &__unread {
    $size: 1.8rem;

    display: flex;
    justify-content: center;
    align-items: center;

    grid-area: unread;
    justify-self: center;
    align-self: center;

    direction: ltr;
    height: $size;
    min-width: $size;
    padding: 0 0.5rem;

    font-size: 1.2rem;
    border-radius: $size / 2;
    color: #fff;
    background-color: $color-blue;
  }
}
</style>
