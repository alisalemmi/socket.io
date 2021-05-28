<template lang="pug">
section.message-list
  ul.message-list__list(v-if='currentRoom', ref='list')
    li(v-for='(chunk, i) in messages[0]', :key='`readed-chunk-${i}`')
      loading

      .message-list__day(
        v-for='(day, j) in chunk',
        :key='`readed-chunk-${i}-day-${j}`'
      )
        span.message-list__date {{ day[0].time | getRelativeDate(false) }}

        message(
          v-for='message in day',
          :key='message.id',
          :sender='message.sender',
          :text='message.text',
          :time='message.time',
          :edited='message.edited',
          :flags='message.flags',
          @hook:mounted='loading = false'
        )

    h1#message-list__unread(ref='unreadLabel', v-if='messages[1].length') پیام های خوانده نشده

    li(v-for='(chunk, i) in messages[1]', :key='`unreaded-chunk-${i}`')
      loading(v-if='i !== 0')

      .message-list__day(
        v-for='(day, j) in chunk',
        :key='`unreaded-chunk-${i}-day-${j}`'
      )
        span.message-list__date(v-if='i !== 0 || j !== 0') {{ day[0].time | getRelativeDate(false) }}

        message(
          v-for='message in day',
          :key='message.id',
          :sender='message.sender',
          :text='message.text',
          :time='message.time',
          :edited='message.edited',
          :flags='message.flags',
          @hook:mounted='loading = false'
        )

  transition(v-else, name='message-list__select-room')
    span.message-list__select-room برای شروع یک گفت و گو را انتخاب کنید
</template>

<script lang="ts">
import { Component, Prop, Ref, Watch, Vue } from 'vue-property-decorator';

import type { MessagesGetter } from '@/@types';

import { getRelativeDate } from '@/util/time/getRelativeDate';

@Component({
  filters: {
    getRelativeDate
  }
})
export default class MessageList extends Vue {
  private loading = false;
  private loadingComponent?: { close: () => {} } = undefined;

  @Prop()
  readonly currentRoom!: string | null;

  @Prop()
  readonly messages!: MessagesGetter;

  @Ref()
  readonly list!: HTMLUListElement;

  @Ref()
  readonly unreadLabel!: HTMLHeadElement;

  loadingObserver: IntersectionObserver | null = null;

  loadMoreMessages(e: IntersectionObserverEntry[]) {
    console.log(e);
  }

  scrollToUnreadLabel() {
    if (this.unreadLabel) this.unreadLabel.scrollIntoView({ block: 'center' });
    else this.$el.scrollTo({ top: this.$el.scrollHeight });
  }

  @Watch('currentRoom')
  onRoomChange() {
    this.loading = true;
  }

  @Watch('loading')
  onMessageLoade(to: boolean, from: boolean) {
    if (to === from) return;

    if (to) {
      // show loading
      this.loadingComponent ||= this.$vs.loading({
        target: this.$el.parentElement,
        color: '#888',
        opacity: 0.9,
        scale: 1.5
      });
    } else {
      // scroll to unread label
      this.$nextTick(() => {
        this.scrollToUnreadLabel();

        // hide loading
        this.loadingComponent?.close();
        this.loadingComponent = undefined;
      });
    }
  }

  mounted() {
    this.loadingObserver = new IntersectionObserver(this.loadMoreMessages, {
      root: this.list,
      threshold: 0.01,
      rootMargin: '200px'
    });
  }
}
</script>

<style lang="scss">
$scroll-width: 0.75rem;
$scroll-padding: 0.5rem;

.message-list {
  position: relative;

  @include scrollbar($width: $scroll-width, $padding: $scroll-padding);

  &__list {
    padding: 1rem 3.5rem 1rem 3.5rem - $scroll-width - 2 * $scroll-padding;

    list-style: none;
  }

  &__day {
    display: flex;
    flex-direction: column;
  }

  &__date {
    display: block;
    position: sticky;
    top: 2rem;

    min-width: 12rem;
    margin: $messageMarginTop auto 0 auto;
    padding: 0.25rem 1rem;

    font-size: 1.2rem;
    text-align: center;
    border-radius: 10rem;
    background-color: $color-white-3;
    z-index: 100;

    box-shadow: $shadow-4;
  }

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

#message-list {
  &__unread {
    display: flex;
    justify-content: center;
    align-items: center;

    padding-top: $messageMarginTop;

    color: $color-primary;
    font-size: 1.3rem;
    font-weight: 700;

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
}
</style>
