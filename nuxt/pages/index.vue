<template lang="pug">
send(
  v-model='messageText',
  :state='sendState',
  :selectedMessage='selectedMessage',
  :typingUsers='typingUsers'
)
</template>

<script lang="tsx">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { TypingUsers } from '@/store';
import Send, { sendState } from '@/components/Send.vue';

@Component({ components: { Send } })
export default class Chat extends Vue {
  selectedMessage = {};
  sendState = sendState.Send;
  messageText = '';

  get typingUsers() {
    return TypingUsers.users;
  }
}
</script>

<style></style>
