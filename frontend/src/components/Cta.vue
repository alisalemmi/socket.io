<template lang="pug">
router-link.cta(v-if='link', :to='link', :class='className')
  slot
button.cta(v-else, :class='className')
  slot
</template>

<script>
export default {
  name: 'cta',
  props: {
    link: String,
    primary: {
      type: Boolean,
      default: false
    },
    outline: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    className: function () {
      return `cta--${this.outline ? 'out' : 'full'}--${
        this.primary ? 'primary' : 'secondary'
      }`;
    }
  }
};
</script>

<style lang="scss">
.cta {
  display: block;
  padding: 0.5rem 1rem;

  text-decoration: none;
  text-align: center;
  font-size: 1.3rem;

  transition: all 0.3s ease;
  border: none;
  outline: none;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }

  @mixin outline($color) {
    color: $color;
    background-color: #fff;
    border: 1px solid $color;
    border-radius: 20rem;

    &:hover {
      background-color: $color;
      color: #fff;
    }
  }

  @mixin full($color) {
    color: #fff;
    background-color: $color;
    border-radius: 0.5rem;

    &:hover {
      background-color: darken($color: $color, $amount: 5);
      border-radius: 1.5rem;
    }
  }

  &--out--primary {
    @include outline($color-primary);
  }

  &--out--secondary {
    @include outline($color-secondary);
  }

  &--full--primary {
    @include full($color-primary);
  }

  &--full--secondary {
    @include full($color-secondary);
  }
}
</style>
