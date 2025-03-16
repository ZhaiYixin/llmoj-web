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
import { type Message } from '../components/ChatConversation.vue';

const textarea = ref('');

const messages = ref<Message[]>([]);

const sendMessage = async () => {
  const userMessage = { 'role': 'user', 'content': textarea.value };
  messages.value.push(userMessage);
  const assistantMessage = ref<Message>({ 'role': 'assistant', 'content': '', 'state': 'loading' })
  messages.value.push(assistantMessage.value)
  textarea.value = '';

  try {
    // axios不支持responseType为stream
    const baseURL = axiosInstance.defaults.baseURL;
    const url = baseURL + '/chat/1/';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userMessage)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (!response.body) throw new Error(`HTTP body empty! status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      console.log('Received chunk:', chunk);
      assistantMessage.value.content += chunk;
    }
    assistantMessage.value.state = 'completed';

    reader.releaseLock();
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
