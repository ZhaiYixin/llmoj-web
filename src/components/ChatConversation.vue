<template>
  <div class="chat-conversation">
    <div v-for="(message, index) in props.messages" :key="index" :class="['message', message.role]">
      <p>{{ message.content }}<el-icon v-if="message.state == 'loading'" color="#409efc" class="loading-icon">
          <Loading />
        </el-icon></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';

export interface Message {
  content: string;
  role: string;
  state?: string;
};

const props = defineProps({
  messages: {
    type: Array as () => Message[],
    default: () => [],
  },
});
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

.loading-icon {
  margin-left: 5px;
  animation: spin 1s linear infinite, fade 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fade {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
