<template>
  <ResizableSplitPane>
    <template #left>
      <ExerciseProblem :problem-list-id="problemListId" v-model:problem-id="problemId" />
    </template>
    <template #right>
      <ExerciseSubmission :problem-id="problemId" />
    </template>
  </ResizableSplitPane>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';

const route = useRoute();
const router = useRouter();

const problemListId = route.params.id as string;
const problemId = ref<string>();

watch(() => route.query.problem, (newProblem) => {
  if (problemId.value !== newProblem) {
    problemId.value = newProblem as string;
  }
}, { immediate: true });

watch(problemId, (newProblemId) => {
  if (route.query.problem !== newProblemId) {
    router.replace({
      query: {
        ...route.query,
        problem: newProblemId,
      },
    });
  }
});
</script>

<style></style>
