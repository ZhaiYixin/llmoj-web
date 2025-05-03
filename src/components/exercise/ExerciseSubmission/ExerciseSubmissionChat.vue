<template>
  <div class="chat">
    <ScrollableContainer class="main" ref="scrollableContainerRef">
      <ChatBotOutput class="chatbot-output" :messages="messages" :recommendations="recommendations"
        @recommendation-click="handleRecommendationClick" />
    </ScrollableContainer>
    <div class="footer">
      <ChatBotInput class="chatbot-input" ref="chatBotInputRef" @sendMessage="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { axiosInstance } from '@/services/http';
import { fetchStreamResponse } from '@/services/streamService';
import ChatBotOutput from '@/components/chatbot/ChatBotOutput.vue';
import ChatBotInput from '@/components/chatbot/ChatBotInput.vue';
import ScrollableContainer from '@/components/chatbot/ScrollableContainer.vue';

const props = defineProps<{
  problemId?: string;
  getSrcAndLang: () => Promise<{ src: string; lang: string }>;
  active: boolean;
}>();

const scrollableContainerRef = ref();
const messages = ref([]);
const recommendations = ref<string[]>([]);
const chatBotInputRef = ref();

const loadMessages = async (problem_id: string) => {
  try {
    const response = await axiosInstance.get(`/judge/problems/${problem_id}/messages/`);
    messages.value = response.data.messages.map(x => {
      const m = x.message;
      const y = {
        content: m.content,
        role: m.role,
      };
      return y;
    });
    await loadRecommendations(problem_id);
    await nextTick();
    scrollableContainerRef.value.scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const sendMessage = async (messageContent: string) => {
  if (!props.problemId) return;
  recommendations.value = [];
  const userMessage = { role: 'user', content: messageContent };
  const assistantMessage = ref({ role: 'assistant', content: '', state: 'loading' });
  messages.value.push(userMessage);
  messages.value.push(assistantMessage.value);
  await nextTick();
  scrollableContainerRef.value.scrollToBottom();

  try {
    // 发送提问内容
    const { src, lang } = await props.getSrcAndLang();
    await axiosInstance.post(`/judge/problems/${props.problemId}/ask/`, JSON.stringify({ content: messageContent, src: src, lang: lang }));

    // 接收流式回答
    await fetchStreamResponse(
      `${axiosInstance.defaults.baseURL}/judge/problems/${props.problemId}/answer/`,
      {
        method: 'GET',
        onChunkReceived: (chunk) => {
          if (assistantMessage.value.content === '') scrollableContainerRef.value.scrollToBottom();
          assistantMessage.value.content += chunk;
          scrollableContainerRef.value.scrollToBottomIfNear();
        },
      }
    );

    assistantMessage.value.state = 'completed';
    await loadRecommendations(props.problemId)
    await nextTick();
    scrollableContainerRef.value.scrollToBottomIfNear(300);
    chatBotInputRef.value.sendEnd();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const loadRecommendations = async (problem_id: string) => {
  const response = await axiosInstance.get(`/judge/problems/${problem_id}/recommendations/`);
  recommendations.value = response.data.recommendations;
};

const handleRecommendationClick = async (recommendation: string) => {
  chatBotInputRef.value.sendBegin(recommendation);
};

watch(() => props.problemId, () => {
  if (props.problemId) {
    loadMessages(props.problemId);
  }
}, { immediate: true });

let activeCounter = 0;

watch(() => props.active, async () => {
  if (props.active) {
    activeCounter++;
    if (activeCounter == 1) {
      await nextTick();
      scrollableContainerRef.value.scrollToBottom();
    }
  }
})
</script>

<style scoped>
.chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.main {
  flex: 1;
  width: 100%;
}

.chatbot-output {
  width: calc(100% - 10px);
  max-width: 780px;
  margin: 0 auto;
}

.footer {
  display: flex;
  justify-content: center;
}

.chatbot-input {
  width: 100%;
  max-width: 800px;
}
</style>
