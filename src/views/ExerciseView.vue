<template>
  <ResizableSplitPane>
    <template #left>
      <ExerciseProblem v-model:problem-id="problemId" />
    </template>
    <template #right>
      <ExerciseSubmission :problem-id="problemId" />
    </template>
  </ResizableSplitPane>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';

const problemId = ref<string | null>('1');
</script>

<style></style>
