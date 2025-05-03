<template>
  <div class="resizable-split-pane">
    <div class="pane" :style="{ flex: leftPaneWidth + '%' }">
      <slot name="left"></slot>
    </div>
    <div class="splitter" @mousedown="startDragging"></div>
    <div class="pane" :style="{ flex: (100 - leftPaneWidth) + '%' }">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const leftPaneWidth = ref(50); // 左侧分区的宽度百分比
let isDragging = false;

const startDragging = (event: MouseEvent) => {
  isDragging = true;
  const startX = event.clientX;
  const startWidth = leftPaneWidth.value;

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const containerWidth = document.querySelector('.resizable-split-pane')?.clientWidth || 1;
    leftPaneWidth.value = Math.min(100, Math.max(0, startWidth + (deltaX / containerWidth) * 100));
  };

  const onMouseUp = () => {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>

<style>
.resizable-split-pane {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

.pane {
  overflow-x: hidden;
  overflow-y: auto;
}

.splitter {
  width: 5px;
  cursor: col-resize;
  background-color: #F0F2F5;
  user-select: none;
}
</style>
