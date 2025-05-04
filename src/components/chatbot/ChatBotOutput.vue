// ChatBotOutput.vue
// 聊天显示框

<template>
  <div class="chat-conversation">
    <ChatBotMessage v-for="(message, index) in props.messages" :key="index" :message="message" />
    <div class="recommendations">
      <el-button class="recommendation" v-for="(recommendation, index) in props.recommendations" :key="index" text bg
        @click="handleRecommendationClick(recommendation)">
        <el-text truncated>{{ recommendation }}</el-text>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatBotMessage from './ChatBotMessage.vue';
import { type ChatBotMessageModel } from './ChatBotMessage.vue';

const props = defineProps({
  messages: {
    type: Array as () => ChatBotMessageModel[],
    default: () => [],
  },
  recommendations: {
    type: Array as () => string[],
    default: () => [],
  }
});

const emit = defineEmits(['recommendation-click']);

function handleRecommendationClick(recommendation: string) {
  emit('recommendation-click', recommendation);
}
</script>

<style scoped>
.chat-conversation {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.recommendations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-bottom: 1em;
}

.recommendation {
  overflow: hidden;
}

:deep(.recommendation>span) {
  max-width: 100%;
}

:deep(.el-button) {
  margin-left: 0 !important;
}
</style>
