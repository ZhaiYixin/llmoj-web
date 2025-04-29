// ChatBot.vue
// 聊天对话

<template>
  <div class="container" v-loading="loading">
    <div class="header">
      <el-dropdown v-if="assignment">
        <el-button tabindex="-1" text>
          {{ assignment.title || '' }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="assignment.problem_list" :icon="EditPen"
              @click="emit('exercise-click', assignment.id)">
              {{ assignment.problem_list.title || '习题' }}
            </el-dropdown-item>
            <el-dropdown-item v-for="(p, i) in assignment.pdfs" :key="p.id" :icon="Document"
              @click="emit('pdf-click', p.id)">
              {{ p.title || '附件' }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <ScrollableContainer class="main" ref="chatContainer">
      <ChatBotOutput class="chatbot-output" :messages="messages" :recommendations="recommendations"
        @recommendation-click="handleRecommendationClick" />
    </ScrollableContainer>
    <div class="footer">
      <ChatBotInput class="chatbot-input" ref="chatBotInput" @sendMessage="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { ArrowDown, EditPen, Document } from '@element-plus/icons-vue';
import ChatBotOutput from './ChatBotOutput.vue';
import ChatBotInput from './ChatBotInput.vue';
import { axiosInstance } from '../../services/http';
import { type ChatBotMessageModel } from './ChatBotMessage.vue';
import ScrollableContainer from './ScrollableContainer.vue';
import { fetchStreamResponse } from '../../services/streamService';

const props = defineProps<{ assignmentId?: string }>();

const emit = defineEmits<{
  (event: 'exercise-click', assignment_id: string): void;
  (event: 'pdf-click', pdf_id: string): void;
}>();

const messages = ref<ChatBotMessageModel[]>([]);
const recommendations = ref<string[]>([]);
const chatContainer = ref();
const loading = ref(false);
const chatBotInput = ref();
const assignment = ref();

// 加载聊天对话
const loadMessages = async () => {
  if (!props.assignmentId) return;

  loading.value = true;
  try {
    const conversation_id = assignment.value?.conversation_id;
    const template_id = assignment.value?.template_id;
    if (conversation_id) {
      const response = await axiosInstance.get(`/chat/conversations/${conversation_id}/messages/`);
      messages.value = response.data.messages;
      await loadRecommendations(conversation_id);
    } else {
      if (template_id) {
        const response2 = await axiosInstance.get(`/chat/templates/${template_id}/`);
        const conversation_id = response2.data.initial_conversation;
        if (conversation_id) {
          const response3 = await axiosInstance.get(`/chat/conversations/${conversation_id}/messages/`);
          messages.value = response3.data.messages;
        } else {
          messages.value = [];
        }
        recommendations.value = response2.data.starters.split('\n');
      } else {
        messages.value = [];
      }
    }
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
  if (!props.assignmentId) return;

  let conversation_id = assignment.value?.conversation_id;
  if (!conversation_id) {
    const template_id = assignment.value?.template_id;
    const response = await axiosInstance.post(`/chat/conversations/start/`, JSON.stringify({ template_id: template_id }));
    conversation_id = response.data.conversation_id;
    await axiosInstance.post(`/assign/homeworks/${props.assignmentId}/conversation/`, JSON.stringify({ conversation_id: conversation_id }));
    assignment.value.conversation_id = conversation_id;
  }

  recommendations.value = [];
  const userMessage = { role: 'user', content: messageContent };
  const assistantMessage = ref<ChatBotMessageModel>({ role: 'assistant', content: '', state: 'loading' });
  messages.value.push(userMessage);
  messages.value.push(assistantMessage.value);
  await nextTick();
  chatContainer.value.scrollToBottom();

  try {
    // 发送提问内容
    await axiosInstance.post(`/chat/conversations/${conversation_id}/ask/`, JSON.stringify(userMessage));

    // 接收流式回答
    await fetchStreamResponse(
      `${axiosInstance.defaults.baseURL}/chat/conversations/${conversation_id}/answer/`,
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
    await loadRecommendations(conversation_id)
    await nextTick();
    chatContainer.value.scrollToBottomIfNear(300);
    chatBotInput.value.sendEnd();
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// 当用户点击了推荐的提问
const handleRecommendationClick = async (recommendation: string) => {
  chatBotInput.value.sendBegin(recommendation);
};

const loadAssignment = async () => {
  if (!props.assignmentId) return;

  const response = await axiosInstance.get(`/assign/homeworks/${props.assignmentId}/`);
  const d = response.data;
  const a = d.assignment;
  assignment.value = {
    id: a.id,
    title: a.conversation_template?.title || a.problem_list.title,
    conversation_id: d.homework?.conversation,
    template_id: a.conversation_template?.id,
    problem_list: a.problem_list,
    pdfs: d.pdfs.map((x) => ({ id: x.pdf.id, title: x.pdf.title })),
  };
};

const loadRecommendations = async (conversation_id: string) => {
  const recommendationsResponse = await axiosInstance.get(`/chat/conversations/${conversation_id}/recommendations/`);
  recommendations.value = recommendationsResponse.data.recommendations;
};

// 当切换会话时
watch(
  () => props.assignmentId,
  async (newId, oldId) => {
    if (newId !== oldId) {
      await loadAssignment();
      recommendations.value = [];
      await loadMessages();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.container {
  border: var(--el-border);
  display: flex;
  flex-direction: column;
}

.header {
  height: 3em;
  padding: 0.5em 1em;
}

.header .el-dropdown {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}

.main {
  flex: 1;
}

.chatbot-output {
  max-width: 780px;
  margin: 0 auto;
}

.footer {
  display: flex;
  justify-content: center;
  padding-bottom: 16px;
}

.chatbot-input {
  width: 800px;
  max-width: 800px;
  border-radius: var(--el-border-radius-round);
}
</style>
