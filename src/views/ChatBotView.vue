<template>
  <div class="chatbot-view">
    <ChatBotSidebar v-model:assignmentId="assignmentId" @exercise-click="handleExerciseClick"
      @pdf-click="handlePdfClick" />
    <ChatBot class="main-content" :assignmentId="assignmentId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChatBot from '@/components/chatbot/ChatBot.vue';
import ChatBotSidebar from '@/components/chatbot/ChatBotSidebar.vue';

const route = useRoute();
const router = useRouter();

const assignmentId = computed({
  get: () => route.query.assignment as string | undefined,
  set: (value) => router.replace({
    query: {
      ...route.query,
      assignment: value,
    },
  }),
});

const handleExerciseClick = (assignment_id: string) => {
  const url = router.resolve({ name: 'exercise', query: { assignment: assignment_id } }).href;
  window.open(url, '_blank');
};

const handlePdfClick = (pdf_id: string) => {
  const url = router.resolve({ name: 'reading', query: { pdf: pdf_id } }).href;
  window.open(url, '_blank');
};

</script>

<style scoped>
.chatbot-view {
  display: flex;
  flex-direction: row;
}

.main-content {
  flex: 1;
}
</style>
