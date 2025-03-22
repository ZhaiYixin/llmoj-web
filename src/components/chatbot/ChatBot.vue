// ChatBot.vue
// 聊天对话

<template>
  <ScrollableContainer ref="chatContainer" v-loading="loading">
    <ChatBotOutput style="flex-grow: 1; flex-shrink: 1;" :messages="messages" :recommendations="recommendations"
      @recommendation-click="handleRecommendationClick" />
    <ChatBotInput ref="chatBotInput" @sendMessage="sendMessage" />
  </ScrollableContainer>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import ChatBotOutput from './ChatBotOutput.vue';
import ChatBotInput from './ChatBotInput.vue';
import { axiosInstance } from '../../services/http';
import { type ChatBotMessageModel } from './ChatBotMessage.vue';
import ScrollableContainer from './ScrollableContainer.vue';
import { fetchStreamResponse } from '../../services/streamService';

const props = defineProps<{ conversation: { id: number } | null }>();
const messages = ref<ChatBotMessageModel[]>([]);
const recommendations = ref<string[]>([]);
const chatContainer = ref();
const loading = ref(false);
const chatBotInput = ref();

// 加载聊天对话
const loadMessages = async () => {
  if (!props.conversation || !props.conversation.id) return;

  loading.value = true;
  try {
    const response = await axiosInstance.get(`/chat/conversations/${props.conversation.id}/messages/`);
    messages.value = response.data.messages;
    await nextTick();
    chatContainer.value.scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  } finally {
    loading.value = false;
  }
};

// 发送消息和接收回答
const sendMessage = async (messageContent: string) => {
  if (!props.conversation || !props.conversation.id) return;

  recommendations.value = [];
  const userMessage = { role: 'user', content: messageContent };
  const assistantMessage = ref<ChatBotMessageModel>({ role: 'assistant', content: '', state: 'loading' });
  messages.value.push(userMessage);
  messages.value.push(assistantMessage.value);
  await nextTick();
  chatContainer.value.scrollToBottom();

  try {
    // 发送提问内容
    await axiosInstance.post(`/chat/conversations/${props.conversation.id}/ask/`, JSON.stringify(userMessage));

    // 接收流式回答
    await fetchStreamResponse(
      `${axiosInstance.defaults.baseURL}/chat/conversations/${props.conversation.id}/answer/`,
      {
        method: 'GET',
        onChunkReceived: (chunk) => {
          if (assistantMessage.value.content === '') chatContainer.value.scrollToBottom();
          assistantMessage.value.content += chunk;
          chatContainer.value.scrollToBottomIfNear();
        },
      }
    );

    assistantMessage.value.state = 'completed';

    // 获取推荐问题
    const recommendationsResponse = await axiosInstance.get(`/chat/conversations/${props.conversation.id}/recommendations/`);
    recommendations.value = recommendationsResponse.data.recommendations;

    chatBotInput.value.sendEnd();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// 当用户点击了推荐的提问
const handleRecommendationClick = async (recommendation: string) => {
  chatBotInput.value.sendBegin(recommendation);
};

// 当切换会话时
watch(
  () => props.conversation?.id,
  async (newId, oldId) => {
    if (newId !== oldId) {
      recommendations.value = [];
      await loadMessages();
    }
  },
  { immediate: true }
);
</script>

<style scoped></style>
