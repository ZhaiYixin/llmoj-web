<template>
  <DesignExercise v-model:problem-list-id="problemListId" @problem-click="handleProblemClick"
    @problem-create-button-click="handleProblemCreateButtonClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DesignExercise from '@/components/teacher/design/DesignExercise.vue';

const route = useRoute();
const router = useRouter();

// 若problemListId为空，则表示新建题目集
const problemListId = computed({
  get: () => route.query.exercise as string | undefined,
  set: (newVal: string | undefined) => {
    router.replace({ query: { ...route.query, exercise: newVal } });
  },
});

const handleProblemClick = (problemId: string) => {
  const url = router.resolve({ name: 'problem', query: { problem: problemId } }).href;
  window.open(url, '_blank');
};

const handleProblemCreateButtonClick = () => {
  const url = router.resolve({ name: 'problem', query: {} }).href;
  window.open(url, '_blank');
};

</script>

<style scoped></style>
