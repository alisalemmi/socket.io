<template lang="pug">
li.room(:class='{ "room--select": selected }')
  avatar.room__image(:member='members', :name='name', :showStatus='true')

  h3.room__name {{ name }}
  p.room__last-message {{ lastMessage && lastMessage.text }}
  span.room__date {{ lastMessage && lastMessage.time | getDate }}
  .room__unread(v-show='unread') {{ unread }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import type { MembersGetter } from '@/@types';
import type { Message } from '@/store/rooms/messages/message';

import { getDate } from '@/util/time/getDate';

@Component({
  filters: {
    getDate
  }
})
export default class Room extends Vue {
  @Prop()
  readonly selected!: boolean;

  @Prop()
  readonly members!: MembersGetter;

  @Prop()
  readonly unread!: number;

  @Prop()
  readonly lastMessage!: typeof Message | undefined;

  get name() {
    const names = this.members.map(member => member.name);
    const lastName = names.pop();

    return names.length ? `${names.join('، ')} و ${lastName}` : lastName;
  }
}
</script>

<style lang="scss">
$padding-tb: 2rem;
$padding-lr: 1.5rem;
$image-size: 5rem;
$scroll-width: 0.75rem;

.room {
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
    background-color: $color-white-5;
  }

  &--select {
    background-color: $color-white-6;
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
