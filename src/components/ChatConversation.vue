<template>
  <div class="chat-conversation">
    <div v-for="(message, index) in props.messages" :key="index" :class="['message', message.role]">
      <p v-html="compiledMarkdown(message.content)">
      </p>
      <el-icon v-if="message.state == 'loading'" color="#409efc" class="loading-icon">
        <Loading />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

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

// 配置 marked 使用 highlight.js
const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

const compiledMarkdown = (content: string) => {
  return marked.parse(content);
};
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
