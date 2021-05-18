<template lang="pug">
li.room(:class='{ "room--select": selected }')
  vs-avatar.room__image(
    :color='color()',
    :title='name',
    size='44',
    :badge='isOnline',
    badge-position='bottom-left'
  )
    template(#text) {{ members[0].name }}

  h3.room__name {{ name }}
  p.room__last-message {{ lastMessage.text }}
  span.room__date {{ lastMessage.time | getDate }}
  .room__unread(v-show='unread') {{ unread }}
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { getDate } from '@/util/time/getDate';

const colors = [
  '#673ab7',
  '#9c27b0',
  '#e91e63',
  '#f44336',
  '#009688',
  '#00bcd4',
  '#03a9f4',
  '#2196f3',
  '#3f51b5',
  '#ffc107',
  '#ffeb3b',
  '#cddc39',
  '#8bc34a',
  '#4caf50',
  '#607d8b',
  '#9e9e9e',
  '#795548',
  '#ff5722',
  '#ff9800'
];

@Component({
  filters: {
    getDate
  }
})
export default class Room extends Vue {
  @Prop()
  private readonly selected!: boolean;

  @Prop()
  private readonly members!: {
    id: string;
    name: string;
    lastSeen: number | 'online';
  }[];

  @Prop()
  private readonly unread!: number;

  @Prop()
  private readonly lastMessage!: {};

  get name() {
    const names = this.members.map(member => member.name);
    const lastName = names.pop();

    return names.length ? `${names.join('، ')} و ${lastName}` : lastName;
  }

  get isOnline() {
    return this.members.some(member => member.lastSeen === 'online');
  }

  color() {
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
</script>

<style lang="scss">
.room {
  $padding-tb: 2rem;
  $padding-lr: 1.5rem;
  $image-size: 5rem;
  $scroll-width: 0.75rem;

  padding: 2rem;

  display: grid;
  grid-template-columns: min-content 1fr max-content max-content;
  grid-template-areas:
    'image name date date'
    'image lastMessage lastMessage unread';

  justify-items: right;
  gap: 0.5rem 1.5rem;

  padding: $padding-tb $padding-lr;
  padding-right: max($padding-lr - $scroll-width, 0);

  cursor: pointer;
  transition: all 0.3s ease;

  @include no-drag();

  &:hover {
    background-color: $color-white-4;
  }

  &--select {
    background-color: $color-white-4;
  }

  &__name {
    width: 100%;
    grid-area: name;

    font-weight: 400;
    font-size: 1.7rem;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &__image {
    grid-area: image;
  }

  &__last-message {
    grid-area: lastMessage;
    width: 100%;

    font-size: 1.3rem;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &__date {
    grid-area: date;
    justify-self: left;
    align-self: center;

    font-size: 1.3rem;
    color: $color-text-gray;
  }

  &__unread {
    $size: 1.8rem;

    display: flex;
    justify-content: center;
    align-items: center;
    justify-self: center;
    align-self: center;

    direction: ltr;
    grid-area: unread;
    height: $size;
    min-width: $size;
    padding: 3px 0.5rem 0 0.5rem;

    font-size: 1.2rem;
    border-radius: $size / 2;
    color: #fff;
    background-color: $color-blue;
  }
}
</style>
