<template>
  <div class="exercise-problem">
    <div class="header">
      <el-text truncated size="large" tag="b">{{ title }}</el-text>
      <el-button-group>
        <el-button text :icon="ArrowLeft" @click="goToPrevious">上一题</el-button>
        <el-button text>{{ "1 / 5" }}</el-button>
        <el-button text @click="goToNext">下一题<el-icon class="el-icon--right">
            <ArrowRight />
          </el-icon></el-button>
      </el-button-group>
    </div>
    <div class="description">
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { axiosInstance } from '@/services/http';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps<{
  problemId: string | null;
}>();

const emit = defineEmits(['update:problem-id']);

const title = ref('')
const description = ref('')

const updateProblem = (id: string) => {
  emit('update:problem-id', id);
  updateContent(id);
};

const goToPrevious = () => {
  if (props.problemId && Number(props.problemId) > 1) {
    updateProblem(String(Number(props.problemId) - 1));
  }
};

const goToNext = () => {
  if (props.problemId && Number(props.problemId) < 2) {
    updateProblem(String(Number(props.problemId) + 1));
  }
};

const updateContent = async (id: string | null) => {
  if (id) {
    const response = await axiosInstance.get(`/judge/problems/?problem_id=${id}`);
    title.value = response.data[0].title;
    description.value = response.data[0].description;
  }
};

onMounted(() => {
  updateContent(props.problemId);
})
</script>

<style scoped>
.exercise-problem {
  padding: 16px;
}

.header {
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  justify-content: space-between;
}
</style>
