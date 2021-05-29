<template lang="pug">
transition(name='context-menu')
  ul.context-menu(v-show='show', v-click-outside='() => (show = false)')
    li.context-menu__item(
      v-for='(option, index) in options',
      :key='index',
      @click.stop='select(option)'
    ) {{ option }}
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import { directive as vClickOutside } from 'v-click-outside';

@Component({ directives: { clickOutside: vClickOutside } })
export default class ContextMenu extends Vue {
  show = false;
  item: object | null = null;
  menuWidth = 0;
  menuHeight = 0;

  @Prop()
  readonly options!: string[];

  async showMenu(event: MouseEvent, item: object) {
    if (this.show) {
      this.show = false;
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    this.item = item;
    const el = this.$el as HTMLElement;

    if (!this.menuWidth || !this.menuHeight) {
      el.style.visibility = 'hidden';
      el.style.display = 'block';
      this.menuWidth = el.offsetWidth;
      this.menuHeight = el.offsetHeight;
      el.removeAttribute('style');
    }

    if (this.menuWidth + event.pageX >= window.innerWidth) {
      el.style.left = `${event.pageX - this.menuWidth + 2}px`;
    } else {
      el.style.left = `${event.pageX - 2}px`;
    }

    if (this.menuHeight + event.pageY >= window.innerHeight) {
      el.style.top = `${event.pageY - this.menuHeight + 2}px`;
    } else {
      el.style.top = `${event.pageY - 2}px`;
    }

    this.show = true;
  }

  @Emit()
  select(_option: string) {
    this.show = false;

    return this.item;
  }

  mounted() {
    this.$root.$on('escape', () => {
      this.show = false;
    });
  }
}
</script>

<style lang="scss">
$context-background: #fff;

.context-menu {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0.5rem 0;

  border-radius: 0.5rem;
  border-bottom-width: 0px;
  background-color: $context-background;
  box-shadow: 0 3px 6px 0 rgba(#333, 0.2);

  list-style: none;
  z-index: 1000000;
  overflow: hidden;

  &__item {
    padding: 1rem 3rem;

    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: $color-white-3;
    }
  }

  transition: transform 0.3s ease, opacity 0.3s ease;
  transform-origin: top;

  &-enter,
  &-leave-to {
    transform: scaleY(0);
    opacity: 0;
  }
}
</style>
