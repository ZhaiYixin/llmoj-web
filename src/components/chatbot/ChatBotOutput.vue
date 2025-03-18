// ChatBotOutput.vue
// 聊天显示框

<template>
  <div class="chat-conversation">
    <ChatBotMessage v-for="(message, index) in props.messages" :key="index" :message="message" />
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
});
</script>

<style scoped>
.chat-conversation {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
