<template lang="pug">
.chat__body(@contextmenu.prevent)
  side-bar.chat__sidebar(
    :rooms='Rooms.rooms',
    :currentRoom='Rooms.currentRoom',
    @select-room='changeRoom'
  )

  message-list.chat__messages(
    :messages='Rooms.messages',
    :currentRoom='Rooms.currentRoom',
    :isEmptyRoom='Rooms.isEmptyRoom',
    @loadMoreMessages='loadMessage',
    @contextmenu='showContextMenu'
  )

  send.chat__send(
    :show='Rooms.currentRoom',
    v-model='messageText',
    :state='sendState',
    :selectedMessage='selectedMessage',
    :typingUsers='TypingUsers.users',
    @type='TypingUsers.type',
    @submit='submit',
    @cancel='resetState'
  )

  context-menu(
    ref='contextMenu',
    :options='options',
    @select='contextMenuSelect'
  )
</template>

<script lang="tsx">
import { Component, Ref, Vue } from 'vue-property-decorator';

import { IMessage } from '@/@types';

import { TypingUsers, Rooms } from '@/store';
import { sendState } from '@/components/Send.vue';
import ContextMenu from '@/components/ContextMenu.vue';

type optionsType = 'کپی' | 'نقل قول' | 'ویرایش' | 'حذف';

@Component
export default class Chat extends Vue {
  readonly Rooms = Rooms;
  readonly TypingUsers = TypingUsers;

  selectedMessage: IMessage | null = null;
  sendState = sendState.Send;
  messageText = '';

  options: optionsType[] = ['کپی', 'نقل قول', 'ویرایش', 'حذف'];

  @Ref()
  contextMenu!: ContextMenu;

  created() {
    this.$socket.client.open();
  }

  mounted() {
    window.addEventListener('keyup', e => {
      if (/^Esc(ape)?$/i.test(e.key)) this.$root.$emit('escape');
    });
  }

  changeRoom(roomId: string) {
    this.resetState();

    Rooms.changeRoom(roomId);
  }

  loadMessage(from: number, dir: 'before' | 'after') {
    this.Rooms.loadMessage({ from, dir });
  }

  showContextMenu(e: MouseEvent, selectedMessage: IMessage) {
    if (selectedMessage.flags.isSend)
      this.options = ['کپی', 'نقل قول', 'ویرایش', 'حذف'];
    else this.options = ['کپی', 'نقل قول'];

    this.contextMenu.showMenu(e, selectedMessage);
  }

  contextMenuSelect(selectedMessage: IMessage, option: optionsType) {
    switch (option) {
      case 'ویرایش':
        this.messageText = selectedMessage.text;
        this.sendState = sendState.Edit;
        this.selectedMessage = selectedMessage;
        break;
    }
  }

  private resetState() {
    this.messageText = '';
    this.selectedMessage = null;
    this.sendState = sendState.Send;
  }

  submit() {
    switch (this.sendState) {
      case sendState.Send:
        Rooms.sendMessage({ messageText: this.messageText });

        this.resetState();
        break;

      case sendState.Edit:
        Rooms.editMessage({
          messageId: this.selectedMessage?.id || '',
          messageText: this.messageText
        });

        this.resetState();
        break;
    }
  }
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

    @at-root #{parent(&)}__body > .vs-loading {
      position: static;
      margin: 0 1rem;
      grid-area: 1 / 2 / -1 / 3;
    }
  }

  &__send {
    grid-area: send;
  }
}
</style>
