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

const problem_id = ref(1)
const title = ref('')
const description = ref('')

const goToPrevious = () => {
  if (problem_id.value > 1) {
    problem_id.value--;
    updateContent();
  }
};

const goToNext = () => {
  if (problem_id.value < 2) {
    problem_id.value++;
    updateContent();
  }
};

const updateContent = async () => {
  const response = await axiosInstance.get(`/judge/problems/?problem_id=${problem_id.value}`);
  title.value = response.data[0].title;
  description.value = response.data[0].description;
};

onMounted(() => {
  updateContent();
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
