<template lang="pug">
ul.sidebar
  room(
    v-for='room in rooms',
    :key='room.id',
    :unread='room.unread',
    :lastMessage='room.lastMessage',
    :members='room.members',
    :selected='room.id === currentRoom',
    @click='$emit("select-room", room.id)'
  )
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class SideBar extends Vue {
  @Prop()
  readonly rooms!: {}; // FIXME: correct type: rooms

  @Prop()
  readonly currentRoom!: string | null;
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
