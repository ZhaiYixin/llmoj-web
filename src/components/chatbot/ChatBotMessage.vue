// ChatBotMessage.vue
// 一条聊天信息

<template>
  <div :class="['message', message.role]">
    <p v-html="compiledMarkdown(message.content)"></p>
    <LoadingIcon v-if="message.state == 'loading'" />
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import LoadingIcon from './LoadingIcon.vue';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';

export interface ChatBotMessageModel {
  content: string;
  role: string;
  state?: string;
};

const props = defineProps({
  message: {
    type: Object as () => ChatBotMessageModel,
    required: true,
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
