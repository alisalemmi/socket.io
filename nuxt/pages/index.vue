<template lang="pug">
send(
  v-model='messageText',
  :state='sendState',
  :selectedMessage='selectedMessage',
  :typingUsers='typingUsers',
  @type='type'
)
</template>

<script lang="tsx">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { TypingUsers } from '@/store';
import { sendState } from '@/components/Send.vue';

@Component
export default class Chat extends Vue {
  selectedMessage = {};
  sendState = sendState.Send;
  messageText = '';

  get typingUsers() {
    return TypingUsers.users;
  }

  type = TypingUsers.type;
}
</script>

<style></style>
