<template lang="pug">
#app
  Nuxt
</template>

<style lang="scss">
@font-face {
  font-family: vazir;
  src: url('@/static/font/Vazir-FD.ttf');
}

*,
*::before,
*::after {
  font-family: vazir, sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
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

a {
  outline: none;
}

#app {
  height: 100%;
  color: $color-text;
  font-size: 1.5rem;
}
</style>
