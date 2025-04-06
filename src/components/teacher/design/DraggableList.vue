<template>
  <VueDraggableNext class="draggable-list" v-model="items" :disabled="props.readonly" @start="dragging = true"
    @end="dragging = false" group="A" ghost-class="dragging-item">
    <div v-for="item in modelValue" :key="itemKey(item)" class="item" @click="handleItemClick(item)">
      <slot name="item" :item="item" />
      <el-icon v-if="!readonly" class="drag-handle">
        <Rank />
      </el-icon>
    </div>
  </VueDraggableNext>
  <div v-if="readonly" />
  <VueDraggableNext v-else-if="dragging" group="A" class="operation" style="border-color: var(--el-color-danger);">
    <el-icon class="operation-icon" style="color: var(--el-color-danger);">
      <DeleteFilled />
    </el-icon>
  </VueDraggableNext>
  <div v-else class="operation el-button" @click="handlePlusButtonClick">
    <el-icon class="operation-icon">
      <Plus />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import { Rank, DeleteFilled, Plus } from '@element-plus/icons-vue';
import type { PropType } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array as PropType<Array<any>>,
    required: true,
  },
  itemKey: {
    type: Function as PropType<(item: any) => string | number>,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: any[]): void;
  (event: 'item-click', item: any): void;
  (event: 'plus-button-click'): void;
}>();

const dragging = ref(false);
const items = computed({
  get: () => props.modelValue,
  set: (newValue: any[]) => {
    emit('update:modelValue', newValue);
  },
});

const handleItemClick = (item: any) => {
  emit('item-click', item);
}

const handlePlusButtonClick = () => {
  emit('plus-button-click');
};

</script>

<style scoped>
.draggable-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item {
  border: var(--el-border);
  padding: 0.5em;
  width: 100%;
  height: 3em;
  cursor: pointer;
  display: flex;
  align-items: center;
  position: relative;
}

.dragging-item {
  border: 2px dashed var(--el-border-color) !important;
  opacity: 0.5;
  background-color: var(--el-color-primary-light-9);
}

.drag-handle {
  position: absolute;
  right: 0.5em;
  top: 50%;
  transform: translateY(-50%);
  cursor: grab;
}

.operation {
  border: 2px dashed var(--el-border-color);
  width: 100%;
  height: 3em;
  position: relative;
}

.operation-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
