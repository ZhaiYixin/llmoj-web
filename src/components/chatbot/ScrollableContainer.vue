// ScrollableContainer.vue

<template>
  <el-scrollbar ref="container">
    <slot></slot>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ScrollbarInstance } from 'element-plus'

const container = ref<ScrollbarInstance>();

const scrollToBottom = () => {
  if (container.value?.wrapRef) {
    const w = container.value.wrapRef;
    container.value.scrollTo(0, w.scrollHeight);
  }
};

const scrollToBottomIfNear = (px: number = 100) => {
  if (container.value?.wrapRef) {
    const w = container.value.wrapRef;
    const clientHeight = w.clientHeight;
    const scrollHeight = w.scrollHeight;
    const scrollTop = w.scrollTop;
    const near = scrollTop + clientHeight >= scrollHeight - px;
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

<style scoped></style>
