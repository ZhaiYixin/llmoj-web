// ChatBot.vue
// 聊天对话

<template>
  <ScrollableContainer ref="chatContainer" v-loading="loading">
    <ChatBotOutput :messages="messages" style="flex-grow: 1; flex-shrink: 1;" />
    <ChatBotInput ref="chatBotInput" @sendMessage="sendMessage" />
  </ScrollableContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import ChatBotOutput from './ChatBotOutput.vue';
import ChatBotInput from './ChatBotInput.vue';
import { axiosInstance } from '../../services/http';
import { type ChatBotMessageModel } from './ChatBotMessage.vue';
import ScrollableContainer from './ScrollableContainer.vue';
import { fetchStreamResponse } from '../../services/streamService';

const messages = ref<ChatBotMessageModel[]>([]);
const chatContainer = ref();
const loading = ref(true);
const chatBotInput = ref();

// 加载聊天对话
const loadMessages = async () => {
  try {
    const response = await axiosInstance.get('/chat/2/');
    messages.value = response.data.messages;
    await nextTick();
    chatContainer.value.scrollToBottom();
    loading.value = false;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

// 发送消息和接收回答
const sendMessage = async (messageContent: string) => {
  const userMessage = { 'role': 'user', 'content': messageContent };
  const assistantMessage = ref<ChatBotMessageModel>({ 'role': 'assistant', 'content': '', 'state': 'loading' });
  messages.value.push(userMessage);
  messages.value.push(assistantMessage.value);
  await nextTick();
  chatContainer.value.scrollToBottom();

  try {
    await fetchStreamResponse(
      `${axiosInstance.defaults.baseURL}/chat/2/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userMessage),
        onChunkReceived: (chunk) => {
          if (assistantMessage.value.content == "") chatContainer.value.scrollToBottom();
          assistantMessage.value.content += chunk;
          chatContainer.value.scrollToBottomIfNear();
        }
      }
    );
    assistantMessage.value.state = 'completed';
    chatBotInput.value.clearMessage();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

onMounted(loadMessages);

</script>

<style scoped></style>
