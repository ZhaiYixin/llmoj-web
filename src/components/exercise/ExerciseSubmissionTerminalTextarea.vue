<template>
  <textarea v-model="text" class="custom-textarea" @input="onInput" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  }
});

const emit = defineEmits(['update:modelValue']);

const text = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    if (text.value !== newValue) {
      text.value = newValue;
    }
  }
);

const onInput = () => {
  emit('update:modelValue', text.value);
};
</script>

<style scoped>
.custom-textarea {
  width: 100%;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
  overflow: auto;
  border: 1px solid var(--el-border-color);
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  white-space: pre;
  resize: none;
}

.custom-textarea:focus {
  outline: none;
  border-color: var(--el-color-primary);
}
</style>
