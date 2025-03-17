<template>
  <div class="chatbot-view" ref="chatContainer" v-loading="loading" @scroll="handleScroll">
    <ChatConversation :messages="messages" class="chat-conversation" />
    <div class="sticky-footer" :style="{ visibility: loading ? 'hidden' : 'visible' }">
      <el-input v-model="textarea" style="width: 100%" :rows="2" type="textarea" placeholder="Please input"
        @keydown.enter.prevent @keyup.enter="handleKeyUpEnter" />
      <el-button class="send-button" @click="sendMessage" type="primary" :icon="Promotion" circle />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import ChatConversation from '../components/ChatConversation.vue';
import { ElInput, ElButton } from 'element-plus';
import { Promotion } from '@element-plus/icons-vue';
import { axiosInstance } from '../services/http';
import { type Message } from '../components/ChatConversation.vue';

const textarea = ref('');
const messages = ref<Message[]>([]);
const chatContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const autoScroll = ref(true);

const sendMessage = async () => {
  const userMessage = { 'role': 'user', 'content': textarea.value };
  messages.value.push(userMessage);
  const assistantMessage = ref<Message>({ 'role': 'assistant', 'content': '', 'state': 'loading' });
  messages.value.push(assistantMessage.value);
  textarea.value = '';

  if (autoScroll.value) scrollToBottom();

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
      assistantMessage.value.content += chunk;
      if (autoScroll.value) scrollToBottom();
    }
    assistantMessage.value.state = 'completed';

    reader.releaseLock();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const handleKeyUpEnter = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) {
    textarea.value += '\n';
  } else {
    sendMessage();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const handleScroll = (e) => {
  const clientHeight = e.target.clientHeight;
  const scrollHeight = e.target.scrollHeight;
  const scrollTop = e.target.scrollTop;

  autoScroll.value = scrollTop + clientHeight >= scrollHeight - 100; // 允许一些误差
};

// 在组件挂载时获取数据并滚动到最下方
onMounted(async () => {
  try {
    const response = await axiosInstance.get('/chat/1/');
    messages.value = response.data.messages;
    await nextTick();
    chatContainer.value?.scrollIntoView({ behavior: 'auto', block: 'end' });
    await nextTick();
    loading.value = false;
    scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
});
</script>

<style scoped>
.chatbot-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
}

.chat-conversation {
  flex-grow: 1;
  flex-shrink: 1;
}

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
