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
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';

const route = useRoute();
const router = useRouter();

const problemListId = computed(() => route.params.id as string | undefined);
const problemId = computed({
  get: () => route.query.problem as string | undefined,
  set: (newVal: string | undefined) => {
    router.replace({
      query: {
        ...route.query,
        problem: newVal,
      },
    });
  },
});
</script>

<style></style>
