<template>
  <div class="chat-conversation">
    <div v-for="(message, index) in props.messages" :key="index" :class="['message', message.role]">
      <p>{{ message.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Message {
  content: string;
  role: string;
}

const props = defineProps({
  messages: {
    type: Array as () => Message[],
    default: () => [],
  }
})
</script>

<style scoped>
.chat-conversation {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.message {
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
}

.message.user {
  text-align: right;
  background-color: #f5f5f5;
  align-self: flex-end;
}

.message.assistant {
  text-align: left;
  align-self: flex-start;
}
</style>
