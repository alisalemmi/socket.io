<template lang="pug">
ul.sidebar
  room(
    v-for='room in Rooms.rooms',
    :key='room.id',
    :unread='room.unread',
    :lastMessage='room.lastMessage',
    :members='room.members',
    :selected='room.id === Rooms.currentRoom'
  )
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Rooms } from '@/store';

@Component
export default class SideBar extends Vue {
  readonly Rooms = Rooms;
}
</script>

<style lang="scss">
.sidebar {
  list-style: none;

  background: $color-white-3;
  box-shadow: $shadow-2;

  @include scrollbar($force-right: true);
}
</style>
