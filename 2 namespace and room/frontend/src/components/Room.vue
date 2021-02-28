<template lang="pug">
li.chat__room__box(
  :class='{ "chat__room__box--select": select }',
  @click='$emit("click", $event)'
)
  img.chat__room__image(:src='image')
  h4.chat__room__title {{ name }}
  span.chat__room__date {{ lastTime }}
  p.chat__room__last {{ lastMessage }}
</template>

<script>
export default {
  name: 'chatRoom',
  props: ['name', 'image', 'lastTime', 'lastMessage', 'select']
};
</script>

<style lang="scss">
.chat__room {
  $padding-tb: 2rem;
  $padding-lr: 1.5rem;
  $scroll-width: 0.75rem;

  background-color: $background-white-2;
  list-style: none;

  @include scrollbar($width: $scroll-width, $force-right: true);

  &__box {
    display: grid;
    grid-template-columns: 5rem 1fr max-content;
    grid-template-areas:
      'image title date'
      'image last last';
    grid-gap: 0.5rem 1.5rem;

    padding: $padding-tb $padding-lr;
    padding-right: max($padding-lr - $scroll-width, 0);

    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: darken($color: $background-white, $amount: 8);
    }

    &--select {
      background-color: darken($color: $background-white, $amount: 10);
    }
  }

  &__image {
    display: block;
    width: 5rem;
    height: 5rem;
    grid-area: image;
    align-self: center;

    border-radius: 50%;
  }

  &__title {
    width: 100%;
    grid-area: title;

    font-weight: 400;
    font-size: 1.7rem;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  &__date {
    grid-area: date;
    justify-self: left;

    font-size: 1.3rem;
    color: $color-text-gray;
  }

  &__last {
    width: 100%;
    grid-area: last;

    font-size: 1.3rem;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
