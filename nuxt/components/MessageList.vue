<template lang="pug">
section.message-list
  ul.message-list__list(v-if='currentRoom', ref='list')
    template(v-for='(chunks, i) in messages')
      template(v-for='(days, j) in chunks')
        loading(v-if='!i || j', :time='getLoadingTime(i, j)')

        template(v-for='(msgs, k) in days')
          span.message-list__date(v-if='!i || j || k') {{ msgs[0].time | getRelativeDate(false) }}

          message(
            v-for='message in msgs',
            :key='message.id',
            :sender='message.sender',
            :text='message.text',
            :time='message.time',
            :edited='message.edited',
            :flags='message.flags',
            @hook:mounted='loading = false'
          )

      h1#message-list__unread(
        ref='unreadLabel',
        v-if='messages[i + 1] && messages[i + 1].length'
      ) پیام های خوانده نشده

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
  readonly unreadLabel!: HTMLHeadElement[] | null;

  loadingObserver: IntersectionObserver | null = null;

  getvisibleLoading() {
    const h = (this.$el as HTMLElement).offsetHeight;

    return Array.from(document.querySelectorAll('.loading')).filter(loading => {
      const y = loading.getBoundingClientRect().y;
      return y > 0 && y < h;
    });
  }

  getLoadingTime(i: number, j: number) {
    if (i) {
      let chunk = this.messages[i][j - 1];

      while (!chunk.length && i >= 0 && j >= 0) {
        j--;

        chunk =
          j > 1
            ? this.messages[i][j - 1]
            : this.messages[--i][this.messages[i].length - 1];
      }

      const day = chunk[chunk.length - 1];

      return day[day.length - 1].time;
    } else {
      return -this.messages[i][j][0][0].time;
    }
  }

  loadMoreMessages(e: Element) {
    const t = (e as Element & { __vue__: any }).__vue__.time;

    this.$emit('loadMoreMessages', Math.abs(t), t < 0 ? 'before' : 'after');
  }

  scrollToUnreadLabel() {
    if (this.unreadLabel?.[0])
      this.unreadLabel[0].scrollIntoView({ block: 'center' });
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
      this.$nextTick(() => {
        // scroll to unread label
        this.scrollToUnreadLabel();

        // find visible loading
        this.getvisibleLoading().forEach(e => this.loadMoreMessages(e));

        // hide loading
        this.loadingComponent?.close();
        this.loadingComponent = undefined;
      });
    }
  }

  mounted() {
    this.loadingObserver = new IntersectionObserver(
      entities => {
        if (!this.loading) {
          entities.forEach(entity => {
            if (entity.isIntersecting) this.loadMoreMessages(entity.target);
          });
        }
      },
      {
        root: this.list,
        threshold: 0.01,
        rootMargin: '200px'
      }
    );
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
    display: flex;
    flex-direction: column;

    padding: 1rem 3.5rem 1rem 3.5rem - $scroll-width - 2 * $scroll-padding;

    list-style: none;
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
    background-color: $color-white-4;
    z-index: 100;

    @include no-drag();
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

    @include no-drag();

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
