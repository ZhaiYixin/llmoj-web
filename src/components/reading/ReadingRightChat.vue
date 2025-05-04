<template>
  <div class="chat">
    <div class="header">
      <el-button tabindex="-1" size="small" text>
        {{ currentSection?.title || title }}
        <el-icon class="el-icon--right">
          <ArrowDown />
        </el-icon>
      </el-button>
    </div>
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
import { nextTick, ref, watch, computed, onMounted } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { axiosInstance } from '@/services/http';
import { fetchStreamResponse } from '@/services/streamService';
import ChatBotOutput from '@/components/chatbot/ChatBotOutput.vue';
import ChatBotInput from '@/components/chatbot/ChatBotInput.vue';
import ScrollableContainer from '@/components/chatbot/ScrollableContainer.vue';

interface Section {
  id: number,
  title: string,
  description: string,
  start_page: number,
  end_page: number,
  questions: string[],
};

const props = defineProps<{
  pdfId?: string;
  current: number;
}>();

const userStore = useUserStore();

const scrollableContainerRef = ref();
const messages = ref([]);
const recommendations = ref<string[]>([]);
const chatBotInputRef = ref();
const sections = ref<Array<Section>>([]);
const title = ref('');

const currentSection = computed(() => sections.value.find((s) => s.start_page <= props.current && props.current <= s.end_page));

const loadMessages = async (pdf_id: string, section_id: string) => {
  try {
    const response = await axiosInstance.get(`/pdf/files/${pdf_id}/messages/?section_id=${section_id}`);
    messages.value = response.data.messages.map(x => {
      const m = x.message;
      const u = m.user;
      let r = m.role;
      if (r == 'user' && u?.username != userStore.info.username) {
        r = 'other';
      }
      const y = {
        content: m.content,
        role: r,
      };
      return y;
    });
    await loadRecommendations();
    await nextTick();
    scrollableContainerRef.value.scrollToBottom();
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};

const sendMessage = async (messageContent: string) => {
  if (!props.pdfId) return;
  recommendations.value = [];
  const userMessage = { role: 'user', content: messageContent };
  const assistantMessage = ref({ role: 'assistant', content: '', state: 'loading' });
  messages.value.push(userMessage);
  messages.value.push(assistantMessage.value);
  await nextTick();
  scrollableContainerRef.value.scrollToBottom();

  try {
    // 发送提问内容
    await axiosInstance.post(`/pdf/files/${props.pdfId}/ask/`, JSON.stringify({ content: messageContent, page_number: props.current, section_id: currentSection.value?.id }));

    // 接收流式回答
    await fetchStreamResponse(
      `${axiosInstance.defaults.baseURL}/pdf/files/${props.pdfId}/answer/`,
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
    if (currentSection.value) {
      await loadRecommendations()
      await nextTick();
      scrollableContainerRef.value.scrollToBottomIfNear(300);
    }
    chatBotInputRef.value.sendEnd();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const handleRecommendationClick = async (recommendation: string) => {
  chatBotInputRef.value.sendBegin(recommendation);
};

const loadRecommendations = async () => {
  if (currentSection.value) {
    const um = messages.value.find((m) => m.role == 'user');
    if (um) {
      recommendations.value = [];
    } else {
      recommendations.value = currentSection.value.questions;
    }
  }
};

const loadPDFAnalysis = async (pdf_id: string) => {
  const url = `/pdf/files/${pdf_id}/analysis/`;
  const response = await axiosInstance.get(url);
  sections.value = response.data.sections;
  title.value = response.data.title;
};

onMounted(() => {
  userStore.fetchInfo();
});

watch(() => props.pdfId, () => {
  if (props.pdfId) {
    loadPDFAnalysis(props.pdfId);
  }
}, { immediate: true });

watch(currentSection, async () => {
  if (props.pdfId && currentSection.value) {
    await loadMessages(props.pdfId, currentSection.value.id.toString());
  } else {
    recommendations.value = [];
  }
}, { immediate: true });
</script>

<style scoped>
.chat {
  width: 20em;
  border: var(--el-border);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.header {
  text-align: center;
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
  padding-bottom: 3px;
}

.chatbot-input {
  width: 100%;
  max-width: 800px;
}
</style>
