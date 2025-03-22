<template>
  <div class="sidebar" @mouseover="isHovered = true" @mouseleave="isHovered = false">
    <div class="menu-item">
      <el-icon>
        <ChatDotRound />
      </el-icon>
      <el-text truncated v-if="isHovered">对话</el-text>
    </div>
    <el-scrollbar class="conversations">
      <div class="conversation" v-for="conv in conversations" :key="conv.id"
        :class="{ selected: selectedConversation?.id === conv.id }" @click="handleConversationSelected(conv)">
        <el-text truncated v-if="isHovered">{{ conv.title ? conv.title : '临时对话' }}</el-text>
      </div>
    </el-scrollbar>
    <div class="menu-item" @click="navigateTo('/exercise')">
      <el-icon>
        <Edit />
      </el-icon>
      <el-text truncated v-if="isHovered">习题</el-text>
    </div>
    <div class="menu-item" @click="navigateTo('/reading')">
      <el-icon>
        <Reading />
      </el-icon>
      <el-text truncated v-if="isHovered">课件</el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Edit, Reading, ChatDotRound } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { axiosInstance } from '@/services/http';

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
}

const emit = defineEmits(['update:selectedConversation']);
const router = useRouter();
const isHovered = ref(false);
const conversations = ref<Conversation[]>([]);
const selectedConversation = ref<Conversation | null>(null);

const navigateTo = (url: string) => {
  router.push(url);
};

const fetchConversations = async () => {
  try {
    const response = await axiosInstance.get('/chat/conversations/');
    conversations.value = response.data.conversations;
    if (conversations.value.length > 0) {
      selectedConversation.value = conversations.value[0];
    }
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
  }
};

const handleConversationSelected = (conversation: Conversation) => {
  selectedConversation.value = conversation;
};

watch(selectedConversation, (newVal) => {
  emit('update:selectedConversation', newVal);
});

onMounted(() => {
  fetchConversations();
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2001;
  height: 100%;
  width: 3em;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  background: var(--el-color-primary-light-9);
}

.sidebar:hover {
  width: 10em;
}

.menu-item {
  height: 3em;
  padding: 0 0.5em;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.menu-item .el-icon {
  font-size: 2em;
}

.menu-item .el-text {
  margin-left: 0.5em;
  font-size: 1.5em;
}

.conversations {
  flex-grow: 1;
}

.conversation {
  height: 2em;
  padding: 0 1em;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.menu-item:hover,
.conversation:hover,
.conversation.selected {
  background-color: var(--el-color-primary-light-8);
}

.conversation .el-text {
  font-size: 1.2em;
}
</style>
