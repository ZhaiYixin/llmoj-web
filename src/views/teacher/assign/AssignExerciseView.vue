<template>
  <AssignExercise v-model:assignment-id="assignmentId" :class-group-id="classGroupId"
    @exercise-click="handleExerciseClick" @problem-click="handleProblemClick"
    @exercise-create-button-click="handleExerciseCreateButtonClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AssignExercise from '@/components/teacher/assign/AssignExercise.vue';

const route = useRoute();
const router = useRouter();

// 若assignmentId为空，则表示新建任务，此时必须传入classGroupId
const classGroupId = computed(() => route.query.classgroup as string | undefined);

const assignmentId = computed({
  get: () => route.query.assignment as string | undefined,
  set: (newVal: string | undefined) => {
    router.replace({ query: { ...route.query, assignment: newVal } });
  },
});

const handleExerciseClick = (problemListId: string) => {
  const url = router.resolve({ name: 'design', query: { exercise: problemListId } }).href;
  window.open(url, '_blank');
};

const handleProblemClick = (problemId: string) => {
  const url = router.resolve({ name: 'problem', query: { problem: problemId } }).href;
  window.open(url, '_blank');
};

const handleExerciseCreateButtonClick = () => {
  const url = router.resolve({ name: 'design', query: {} }).href;
  window.open(url, '_blank');
};
</script>

<style scoped></style>
