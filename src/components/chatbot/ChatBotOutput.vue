// ChatBotOutput.vue
// 聊天显示框

<template>
  <div class="chat-conversation">
    <ChatBotMessage v-for="(message, index) in props.messages" :key="index" :message="message" />
    <div class="recommendations">
      <button v-for="(recommendation, index) in props.recommendations" :key="index"
        @click="handleRecommendationClick(recommendation)">
        {{ recommendation }}
      </button>
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
  margin-top: 10px;
}

.recommendations button {
  margin: 5px;
  padding: 10px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
}

.recommendations button:hover {
  background-color: #e0e0e0;
}
</style>
