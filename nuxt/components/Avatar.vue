<template lang="pug">
vs-avatar(
  v-if='image',
  :color='color',
  :title='name',
  :badge='showStatus && isOnline',
  badge-position='bottom-left'
)
  img(:src='image')

vs-avatar(
  v-else,
  :color='color',
  :title='name',
  :badge='showStatus && isOnline',
  badge-position='bottom-left'
)
  template(#text) {{ name }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import type { MembersGetter } from '@/@types';

const colors = [
  '#673ab7',
  '#9c27b0',
  '#e91e63',
  '#f44336',
  '#009688',
  '#00bcd4',
  '#03a9f4',
  '#2196f3',
  '#3f51b5',
  '#ffc107',
  '#ffeb3b',
  '#cddc39',
  '#8bc34a',
  '#4caf50',
  '#607d8b',
  '#9e9e9e',
  '#795548',
  '#ff5722',
  '#ff9800'
];

@Component
export default class Avatar extends Vue {
  @Prop()
  private members!: MembersGetter;

  @Prop({ default: '' })
  private name!: string;

  @Prop({ default: false })
  private showStatus!: boolean;

  get isGroup() {
    return this.members.length !== 1;
  }

  get color() {
    if (this.isGroup || this.members[0].image) return 'transparent';

    return colors[
      this.members.reduce(
        (acc, cur) => (parseInt(cur.id, 16) + acc) % colors.length,
        0
      )
    ];
  }

  get image() {
    if (this.isGroup) return `image/group.svg`;
    return this.members[0].image ? `image/${this.members[0].image}` : '';
  }

  get isOnline() {
    return this.members.some(member => member.lastSeen === 'online');
  }
}
</script>

<style lang="scss"></style>
