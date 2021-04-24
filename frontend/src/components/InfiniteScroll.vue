<template lang="pug">
.infinite-scroll(@scroll='scroll')
  .infinite-scroll__spinner(v-show='busyUp')
  slot
  .infinite-scroll__spinner(v-show='busyDown')
</template>

<script>
import { throttle } from 'lodash';

export default {
  name: 'infiniteScroll',
  props: {
    busyUp: {
      type: Boolean,
      default: true
    },
    busyDown: {
      type: Boolean,
      default: true
    },
    completeUp: {
      type: Boolean,
      default: false
    },
    completeDown: {
      type: Boolean,
      default: false
    },
    tab: {
      required: true
    }
  },
  data: function () {
    return {
      initiated: {
        up: false,
        down: false
      }
    };
  },
  methods: {
    load: function (direction, force = false) {
      if (
        !force &&
        (direction
          ? this.completeUp || this.busyUp
          : this.completeDown || this.busyDown)
      )
        return;

      this.$emit('load', direction);
    },
    scroll: throttle(function ({ target }) {
      if (target.scrollTop < 200) this.load(true);
      else if (
        target.scrollHeight - target.scrollTop - target.offsetHeight <
        200
      )
        this.load(false);
    }, 300)
  },
  watch: {
    tab: function (to) {
      this.initiated.up = false;
      this.initiated.down = false;

      if (to) {
        this.load(true, true);
        this.load(false, true);
      }
    },
    busyUp: function (to) {
      if (!to && !this.initiated.up) {
        this.initiated.up = true;

        if (this.initiated.down) this.$emit('initiated');
      }
    },
    busyDown: function (to) {
      if (!to && !this.initiated.down) {
        this.initiated.down = true;

        if (this.initiated.up) this.$emit('initiated');
      }
    }
  }
};
</script>

<style lang="scss">
.infinite-scroll {
  &__spinner {
    $size: 3.5rem;

    margin: $size auto $size / 2 auto;
    width: 1em;
    flex: 1em 0 0;
    font-size: $size;

    color: $color-text-gray-2;
    border-radius: 50%;

    overflow: hidden;
    transform: translateZ(0);

    animation: loading 1.7s infinite ease-in-out, round 1.7s infinite ease;
  }

  @keyframes loading {
    0% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
        0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
    5%,
    95% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
        0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
    10%,
    59% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em,
        -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em,
        -0.297em -0.775em 0 -0.477em;
    }
    20% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em,
        -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em,
        -0.749em -0.34em 0 -0.477em;
    }
    38% {
      box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em,
        -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em,
        -0.82em -0.09em 0 -0.477em;
    }
    100% {
      box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em,
        0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
    }
  }

  @keyframes round {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }
}
</style>
