<template lang="pug">
.chat__body
  side-bar.chat__sidebar(
    :rooms='Rooms.rooms',
    :currentRoom='Rooms.currentRoom',
    @select-room='Rooms.changeRoom($event)'
  )

  message-list.chat__messages(:currentRoom='Rooms.currentRoom')

  send.chat__send(
    :show='Rooms.currentRoom',
    v-model='messageText',
    :state='sendState',
    :selectedMessage='selectedMessage',
    :typingUsers='TypingUsers.users',
    @type='TypingUsers.type'
  )
</template>

<script lang="tsx">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { TypingUsers, Rooms } from '@/store';
import { sendState } from '@/components/Send.vue';

@Component
export default class Chat extends Vue {
  readonly Rooms = Rooms;
  readonly TypingUsers = TypingUsers;

  selectedMessage = {};
  sendState = sendState.Send;
  messageText = '';
}
</script>

<style lang="scss">
.chat {
  $sidebar-large-width: 30%;
  $sidebar-small-width: 35rem;
  $sidebar-icon-only-width: calc(44px + #{0.75rem * 2 + 0.1rem});

  &__body {
    display: grid;
    grid-template-columns: $sidebar-large-width 1fr;
    grid-template-rows: min-content 1fr min-content;
    grid-template-areas:
      'nav nav'
      'sidebar messages'
      'sidebar send';

    @include respond(tab-land) {
      grid-template-columns: minmax($sidebar-small-width, $sidebar-large-width) 1fr;
    }

    @include respond(tab-port-hover) {
      grid-template-columns: $sidebar-icon-only-width 1fr;
    }

    @include respond(tab-port-touch) {
      grid-template-columns: 1fr;
      grid-template-areas:
        'nav'
        'messages'
        'send';
    }

    @include respond(phone) {
      grid-template-columns: 1fr;
      grid-template-areas:
        'nav'
        'messages'
        'send';
    }

    height: 100%;

    overflow: hidden;
  }

  &__sidebar {
    grid-area: sidebar;
    transition: all 0.3s ease;

    @include respond(tab-port-hover) {
      position: absolute;
      width: $sidebar-icon-only-width;
      height: 100%;

      &:hover {
        width: $sidebar-small-width;
      }
    }

    @include respond(tab-port-touch) {
      grid-area: -1 / -1 / 1 / 1;

      &--close {
        transform: translateX(100%);
      }
    }

    @include respond(phone) {
      grid-area: -1 / -1 / 1 / 1;

      &--close {
        transform: translateX(100%);
      }
    }

    z-index: 10;
  }

  &__messages {
    grid-area: messages;
  }

  &__send {
    grid-area: send;
  }
}
</style>
