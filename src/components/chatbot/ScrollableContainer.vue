// ScrollableContainer.vue

<template>
  <div class="scrollable-container" ref="container">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const container = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  if (container.value) {
    container.value.scrollTop = container.value.scrollHeight;
  }
};

const scrollToBottomIfNear = () => {
  if (container.value) {
    const clientHeight = container.value.clientHeight;
    const scrollHeight = container.value.scrollHeight;
    const scrollTop = container.value.scrollTop;
    const NEAR = 100;
    const near = scrollTop + clientHeight >= scrollHeight - NEAR;
    if (near) {
      scrollToBottom();
    }
  }
};

defineExpose({
  scrollToBottom,
  scrollToBottomIfNear
});
</script>

<style scoped>
.scrollable-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
