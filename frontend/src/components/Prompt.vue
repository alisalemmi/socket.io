<template lang="pug">
transition(name='prompt')
  .prompt(
    v-show='show',
    :class='{ "prompt--show": show }',
    @click='click(false)'
  )
    .prompt__body(@click.stop)
      h2.prompt__title {{ title }}
      p.prompt__text {{ text }}

      .prompt__btn__box
        cta.prompt__btn(link='', primary, @click.native='click(true)') {{ btnYes }}
        cta.prompt__btn(link='', @click.native='click(false)') {{ btnNo }}
</template>

<script>
import Cta from './Cta.vue';

const data = {
  title: '',
  text: '',
  btnYes: '',
  btnNo: '',
  show: false,
  callback: null
};

/**
 * Blend two colors together.
 * @param {{title: string, text: string, btnYes?: string, btnNo?: string}} options
 * @param {(result: boolean) => void} callback
 */
export const prompt = (options, callback) => {
  data.title = options.title || '';
  data.text = options.text || '';
  data.btnYes = options.btnYes || 'تایید';
  data.btnNo = options.btnNo || 'لغو';

  data.show = true;
  data.callback = callback;
};

export default {
  name: 'Prompt',
  data: function () {
    return data;
  },
  components: { Cta },
  methods: {
    click: function (result) {
      this.show = false;
      this.callback(result);
    }
  }
};
</script>

<style lang="scss">
.prompt {
  display: flex;
  justify-content: center;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  z-index: 100;
  backdrop-filter: brightness(1) blur(0);
  transition: all 0.5s ease;

  &--show {
    backdrop-filter: brightness(0.8) blur(1px);
  }

  &__body {
    padding: 2rem;
    max-width: 50vw;

    transition: opacity 0.2s ease, transform 0.3s ease;

    @include respond(tab-port) {
      max-width: 70vw;
    }

    @include respond(phone) {
      max-width: 90vw;
    }

    @include round-box($box-shadow: none);
  }

  &__title {
    margin: 2rem 0;
    font-size: 2rem;
    font-weight: 400;
    text-align: center;
  }

  &__text {
    padding: 1rem;
  }

  &__btn {
    margin: 0 1rem;
    flex: 1;
    max-width: 14rem;

    &__box {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }
  }

  &-enter,
  &-leave-to {
    backdrop-filter: brightness(1) blur(0);
    opacity: 0;
  }

  &-enter > &,
  &-leave-to > & {
    transform: scale(0.9);
  }
}
</style>
