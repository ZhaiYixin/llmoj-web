// ChatBotInput.vue
// 聊天输入框

<template>
  <div ref="containerRef" class="container">
    <div v-if="isNarrow" class="small-container">
      <el-input v-model="textareaValue" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder="有什么问题尽管问我"
        @keydown.enter.prevent @keyup.enter="handleKeyUpEnter" />
      <el-button class="send-button" @click="sendBegin()" type="primary" :icon="Upload" circle :loading="sendDisabled"
        :disabled="!textareaValue" />
    </div>
    <div v-else class="big-container">
      <el-input v-model="textareaValue" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="有什么问题尽管问我"
        @keydown.enter.prevent @keyup.enter="handleKeyUpEnter" />
      <div class="footer">
        <el-button class="send-button" @click="sendBegin()" type="primary" :icon="Upload" circle :loading="sendDisabled"
          :disabled="!textareaValue" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { ElInput, ElButton } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';

const emit = defineEmits(['sendMessage']);
const textareaValue = ref('');
const sendDisabled = ref(false);
const containerRef = ref<HTMLElement>();
const isNarrow = ref(false);

const handleKeyUpEnter = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) {
    textareaValue.value += '\n';
  } else {
    if (textareaValue.value) {
      sendBegin();
    }
  }
};

const sendBegin = async (newTextareaValue?: string) => {
  if (newTextareaValue) {
    textareaValue.value = newTextareaValue;
  }
  try {
    sendDisabled.value = true;
    emit('sendMessage', textareaValue.value);
    textareaValue.value = '';
  } catch (error) {
    console.error('Error in sendMessage:', error);
    sendDisabled.value = false;
  }
};

const sendEnd = async () => {
  sendDisabled.value = false;
};

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    isNarrow.value = entry.contentRect.width < 500;
  }
});

onMounted(() => {
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  resizeObserver.disconnect();
});

defineExpose({ sendBegin, sendEnd });
</script>

<style scoped>
.container {
  margin: 0 5px;
  border: var(--el-border);
  border-radius: var(--el-border-radius-round);
  box-shadow: var(--el-box-shadow-lighter);
}

.small-container {
  padding: 3px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.big-container {
  padding: 5px;
}

.container:focus-within {
  border-color: var(--el-color-primary);
}

:deep(.el-textarea__inner) {
  resize: none;
  box-shadow: none !important;
  font-size: var(--el-font-size-medium);
}

.footer {
  display: flex;
  justify-content: flex-end;
}

.send-button {
  margin: 5px;
}
</style>
