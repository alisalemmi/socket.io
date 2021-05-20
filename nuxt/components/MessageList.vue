<template lang="pug">
section.message-list
  ul(v-if='currentRoom') TODO

  transition(v-else, name='message-list__select-room')
    span.message-list__select-room برای شروع یک گفت و گو را انتخاب کنید
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MessageList extends Vue {
  @Prop()
  readonly currentRoom!: string | null;
}
</script>

<style lang="scss">
.message-list {
  position: relative;

  &__select-room {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    padding: 0.5rem 1rem;
    font-size: 1.2rem;
    text-align: center;
    border-radius: 10rem;
    background-color: $color-white-4;

    transition: all $selectRoomDuration ease;

    &-enter,
    &-leave-to {
      opacity: 0;
    }
  }
}
</style>
