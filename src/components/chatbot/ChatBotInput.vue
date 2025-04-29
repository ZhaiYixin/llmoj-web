// ChatBotInput.vue
// 聊天输入框

<template>
  <div class="container">
    <el-input v-model="textareaValue" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" placeholder="有什么问题尽管问我"
      @keydown.enter.prevent @keyup.enter="handleKeyUpEnter" />
    <div class="footer">
      <el-button class="send-button" @click="sendBegin()" type="primary" :icon="Upload" circle :loading="sendDisabled"
        :disabled="!textareaValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElInput, ElButton } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';

const emit = defineEmits(['sendMessage']);
const textareaValue = ref('');
const sendDisabled = ref(false);

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

defineExpose({ sendBegin, sendEnd });
</script>

<style scoped>
.container {
  padding: 5px;
  border: var(--el-border);
  box-shadow: var(--el-box-shadow-lighter);
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
