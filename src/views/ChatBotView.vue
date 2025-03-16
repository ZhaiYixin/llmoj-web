<template>
  <div class="chatbot-view">
    <ChatConversation :messages="messages" />
    <div class="fixed-bottom">
      <el-input v-model="textarea" style="width: 100%" :rows="2" type="textarea" placeholder="Please input" />
      <el-button class="send-button" @click="sendMessage" type="primary" :icon="Promotion" circle />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ChatConversation from '../components/ChatConversation.vue';
import { ElInput } from 'element-plus';
import { Promotion } from '@element-plus/icons-vue';
import { axiosInstance } from '../services/http';

const textarea = ref('');
interface Message {
  role: string;
  content: string;
}

const messages = ref<Message[]>([]);

const sendMessage = async () => {
  const userMessage = { 'role': 'user', 'content': textarea.value };
  try {
    const response = await axiosInstance.post('/chat/1/', userMessage);
    messages.value.push(userMessage);
    messages.value.push({ 'role': 'assistant', 'content': response.data.response });
    textarea.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// 在组件挂载时获取数据
onMounted(async () => {
  try {
    const response = await axiosInstance.get('/chat/1/');
    messages.value = response.data.messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
});
</script>

<style scoped>
.chatbot-view {
  width: 100%;
  height: 100%;
}

.fixed-bottom {
  position: fixed;
  bottom: 0;
  width: 90%;
  left: 50%;
  transform: translateX(-50%);
}

.send-button {
  position: absolute;
  right: 10px;
  top: 10px;
}
</style>
