<template lang="pug">
.chat
  transition-group.chat__room(tag='ul')
    room(
      v-for='room in rooms',
      :key='room.id',
      :members='room.members',
      :lastMessage='room.lastMessage.text',
      :lastTime='room.lastMessage.time',
      :select='room.id === currentRoom',
      @click='changeRoom(room.id)'
    )

  infinite-scroll.chat__message(
    ref='infiniteScroll',
    :busyUp='busy.up',
    :busyDown='busy.down',
    :completeUp='complete.up',
    :completeDown='complete.down',
    :tab='currentRoom',
    @load='loadMessage',
    @initiated='initiated'
  )
    template(v-for='message in messages')
      .chat__timeline(v-if='message.timeline', :key='`${message.id}-time`') {{ message.time | formatTime }}

      #chat__unread.chat__unread(
        :key='message.id',
        v-if='message.id === "unread"'
      ) پیام های خوانده نشده

      message(
        :key='message.id',
        :id='message.id',
        v-else,
        :isSend='message.isSend',
        :senderName='message.senderName',
        :senderImage='`/image/${message.senderImage}`',
        :text='message.text',
        :time='message.time',
        :edited='message.edited',
        :quote='message.quote',
        :continues='message.continues',
        :rounded='message.rounded',
        @quoteClicked='quoteClicked',
        @contextmenu.prevent.stop='showContextMenu($event, message)'
      )

    context-menu(
      :options='menuOptions',
      ref='messageContext',
      @select='contextMenuSelect'
    )

  send(
    ref='chatInput',
    v-model='message',
    :state='state',
    :selectedMessage='selectedMessage',
    :typingUsers='typingUsers',
    @submit='submit',
    @typing='sendTyping',
    @cancel='resetState(false)'
  )
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import infiniteScroll from '@/components/InfiniteScroll.vue';
import ContextMenu from '@/components/Context';
import { prompt } from '@/components/Prompt';
import { getDate } from '@/util/time';
import Room from '@/components/Room';
import Send from '@/components/Send';
import Message from '@/components/Message';

let observer;

export default {
  name: 'Chat',
  components: { Room, Send, Message, infiniteScroll, ContextMenu },
  data: function () {
    return {
      state: 'send',
      busy: { up: false, down: false },
      complete: { up: false, down: false },
      message: '',
      selectedMessage: {},
      menuOptions: [
        { name: 'کپی' },
        { name: 'نقل قول' },
        { name: 'ویرایش' },
        { name: 'حذف' }
      ]
    };
  },
  methods: {
    ...mapActions([
      'sendMessage',
      'editMessage',
      'deleteMessage',
      'sendTyping',
      'getHistory',
      'readMessage'
    ]),
    loadMessage: async function (direction) {
      if (!this.currentRoom) return;

      const dir = direction ? 'up' : 'down';

      this.busy[dir] = true;
      const messages = await this.getHistory(direction);
      this.busy[dir] = false;

      if (!messages.length) this.complete[dir] = true;
    },
    initiated: function () {
      this.scrollTo('chat__unread') || this.scrollToEnd();
    },
    changeRoom: function (roomId) {
      this.$store.dispatch('changeRoom', roomId);
      observer.disconnect();
    },
    resetState: function (clearInput = false) {
      this.state = 'send';
      this.selectedMessage = {};

      if (clearInput) this.message = '';
    },
    submit: function () {
      switch (this.state) {
        case 'quote':
        case 'send':
          this.sendMessage({
            message: this.message,
            quoteRef: this.selectedMessage.id
          });
          break;
        case 'edit':
          this.editMessage({
            id: this.selectedMessage.id,
            newText: this.message
          });
          break;
      }

      this.resetState(true);
    },
    showContextMenu: function (e, message) {
      this.menuOptions = message.isSend
        ? [
            { name: 'کپی' },
            { name: 'نقل قول' },
            { name: 'ویرایش' },
            { name: 'حذف' }
          ]
        : [{ name: 'کپی' }, { name: 'نقل قول' }];

      this.$refs.messageContext.showMenu(e, message);
    },
    contextMenuSelect: function ({ option, item }) {
      switch (option.name) {
        case 'کپی':
          navigator.clipboard.writeText(item.text);
          break;
        case 'ویرایش':
          this.state = 'edit';
          this.selectedMessage = item;
          this.message = item.text;

          this.$refs.chatInput.focus();
          break;
        case 'نقل قول':
          this.state = 'quote';
          this.selectedMessage = item;

          this.$refs.chatInput.focus();
          break;
        case 'حذف':
          prompt(
            {
              title: 'حذف پیام',
              text: 'آیا از حذف پیام اطمینان دارید؟',
              btnYes: 'حذف'
            },
            res => {
              if (res) this.deleteMessage(item.id);
            }
          );
          break;
      }
    },
    quoteClicked: function (quoteRef) {
      this.scrollTo(quoteRef);
    },
    scrollTo: function (id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return el != undefined;
    },
    scrollToEnd: function () {
      if (this.$el.children[1]?.lastChild)
        this.$el.children[1].lastChild.scrollIntoView({ behavior: 'smooth' });
    }
  },
  computed: {
    ...mapState(['currentRoom']),
    ...mapGetters(['rooms', 'messages', 'typingUsers'])
  },
  filters: {
    formatTime: getDate
  },
  watch: {
    messages: function (to, from) {
      const unreadIndex = to.findIndex(message => message.id === 'unread');
      if (unreadIndex === -1) return;

      const old = new Set(from.map(f => f.id));

      to.slice(unreadIndex + 1)
        .filter(t => !old.has(t.id))
        .forEach(t => {
          this.$nextTick(() => observer.observe(document.getElementById(t.id)));
        });
    }
  },
  mounted: function () {
    observer = new IntersectionObserver(
      e => {
        if (!this.busy.up && !this.busy.down)
          e.forEach(message => {
            if (message.isIntersecting) {
              observer.unobserve(message.target);
              this.readMessage(message.target.id);
            }
          });
      },
      {
        root: this.$refs.infiniteScroll.$el,
        threshold: 1.0
      }
    );
  }
};
</script>

<style lang="scss">
.chat {
  display: grid;
  grid-template-columns: minmax(30%, 30rem) 1fr;
  grid-template-rows: 1fr min-content;
  grid-template-areas:
    'rooms chats'
    'rooms send';

  height: 100%;

  @include no-drag();

  @include respond(tab-port) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr min-content;
    grid-template-areas:
      'chats'
      'send';
  }

  &__room {
    grid-area: rooms;

    @include respond(tab-port) {
      display: none;
    }
  }

  &__send {
    grid-area: send;
    margin: 1rem;
  }

  &__message {
    padding: 0 2rem;
    grid-area: chats;
  }

  &__unread {
    display: flex;
    justify-content: center;
    align-items: center;

    padding-top: 2rem;

    color: $color-primary;
    font-size: 1.3rem;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;

      background-color: currentColor;
    }

    &::before {
      margin-left: 1rem;
    }

    &::after {
      margin-right: 1rem;
    }
  }

  &__timeline {
    position: sticky;
    top: 2rem;

    min-width: 12rem;
    margin: 1.5rem auto 0 auto;
    padding: 0.25rem 1rem;

    font-size: 1.2rem;
    text-align: center;
    border-radius: 10rem;
    background-color: $background-white-3;
  }
}
</style>
