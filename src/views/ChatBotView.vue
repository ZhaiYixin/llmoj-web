<template>
  <div class="chatbot-view">
    <ChatBotSidebar v-model:selectedConversation="selectedConversation" />
    <ChatBot class="main-content" :conversation="selectedConversation" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatBot from '@/components/chatbot/ChatBot.vue';
import ChatBotSidebar from '@/components/chatbot/ChatBotSidebar.vue';
import type { Conversation } from '@/components/chatbot/ChatBotSidebar.vue';

const selectedConversation = ref<Conversation | null>(null);
</script>

<style scoped>
.chatbot-view {
  display: flex;
  flex-direction: row;
}

.main-content {
  flex-grow: 1;
  margin-left: 3em;
}
</style>
