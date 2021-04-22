<template lang="pug">
#app(@contextmenu.prevent)
  router-view
  prompt
</template>

<script>
import Prompt from '@/components/Prompt';

export default {
  components: { Prompt },
  mounted: function () {
    window.addEventListener('keyup', e => {
      if (/^Esc(ape)?$/i.test(e.key)) this.$root.$emit('escape');
    });
  }
};
</script>

<style lang="scss">
@font-face {
  font-family: vazir;
  src: url('./assets/font/Vazir-FD.ttf');
}

*,
*::before,
*::after {
  font-family: vazir, sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

a {
  outline: none;
}

html {
  direction: rtl;
  height: 100%;
  font-size: 62.5%;

  @include respond(big-desktop) {
    font-size: 70%;
  }
  @include respond(tab-land) {
    font-size: 58%;
  }
  @include respond(tab-port) {
    font-size: 55%;
  }
  @include respond(phone) {
    font-size: 45%;
  }
}

body {
  height: 100%;
}

#app {
  color: $color-text;
  font-size: 1.5rem;
  height: 100%;
}
</style>
