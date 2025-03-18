// ChatBotInput.vue
// 聊天输入框

<template>
  <div class="sticky-footer">
    <el-input v-model="textareaValue" style="width: 100%" :rows="2" type="textarea" placeholder="Please input"
      @keydown.enter.prevent @keyup.enter="handleKeyUpEnter" :disabled="sendDisabled" />
    <el-button class="send-button" @click="emitSendMessage" type="primary" :icon="Promotion" circle
      :disabled="sendDisabled" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElInput, ElButton } from 'element-plus';
import { Promotion } from '@element-plus/icons-vue';

const emit = defineEmits(['sendMessage']);
const textareaValue = ref('');
const sendDisabled = ref(false);

const handleKeyUpEnter = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) {
    textareaValue.value += '\n';
  } else {
    emitSendMessage();
  }
};

const emitSendMessage = () => {
  try {
    sendDisabled.value = true;
    emit('sendMessage', textareaValue.value);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    sendDisabled.value = false;
  }
};

const clearMessage = () => {
  textareaValue.value = '';
  sendDisabled.value = false;
};

defineExpose({ clearMessage });
</script>

<style scoped>
.sticky-footer {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 10px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.send-button {
  position: absolute;
  right: 10px;
  top: 10px;
}
</style>
