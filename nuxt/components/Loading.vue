<template lang="pug">
.loading(ref='loading')
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from 'vue-property-decorator';

@Component
export default class Loading extends Vue {
  @Prop()
  readonly time!: number;

  @Ref()
  readonly loading!: HTMLDivElement;

  private observe() {
    const observer = this.$parent.$data.loadingObserver as IntersectionObserver;

    observer.observe(this.$el);
  }

  mounted() {
    this.$vs.loading({
      target: this.loading,
      color: '#9e9e9e'
    });

    this.observe();
  }
}
</script>

<style lang="scss">
.loading {
  margin-bottom: -$messageMarginTop;

  & > .vs-loading {
    position: relative;
    background: none;
  }
}
</style>
