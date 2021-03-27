<template lang="pug">
transition(name='context-menu')
  ul.context-menu(v-show='show', v-click-outside='() => (show = false)')
    li.context-menu__item(
      v-for='(option, index) in options',
      :key='index',
      @click.stop='optionClicked(option)'
    ) {{ option.name }}
</template>

<script>
import vClickOutside from 'v-click-outside';

export default {
  name: 'ContextMenu',
  props: {
    options: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      show: false,
      item: null,
      menuWidth: null,
      menuHeight: null
    };
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  methods: {
    async showMenu(event, item) {
      if (this.show) {
        this.show = false;
        await new Promise(res => setTimeout(res, 150));
      }

      this.item = item;

      if (!this.menuWidth || !this.menuHeight) {
        this.$el.style.visibility = 'hidden';
        this.$el.style.display = 'block';
        this.menuWidth = this.$el.offsetWidth;
        this.menuHeight = this.$el.offsetHeight;
        this.$el.removeAttribute('style');
      }

      if (this.menuWidth + event.pageX >= window.innerWidth) {
        this.$el.style.left = `${event.pageX - this.menuWidth + 2}px`;
      } else {
        this.$el.style.left = `${event.pageX - 2}px`;
      }

      if (this.menuHeight + event.pageY >= window.innerHeight) {
        this.$el.style.top = `${event.pageY - this.menuHeight + 2}px`;
      } else {
        this.$el.style.top = `${event.pageY - 2}px`;
      }

      this.show = true;
    },
    optionClicked(option) {
      this.show = false;

      this.$emit('select', {
        item: this.item,
        option
      });
    }
  },
  mounted() {
    this.$root.$on('escape', () => {
      this.show = false;
    });
  }
};
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
      background-color: darken($color: $background-white, $amount: 7);
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
