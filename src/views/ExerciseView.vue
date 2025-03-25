<template>
  <ResizableSplitPane>
    <template #left>
      <ExerciseProblem />
    </template>
    <template #right>
      <ExerciseSubmission />
    </template>
  </ResizableSplitPane>
</template>

<script setup lang="ts">
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';
</script>

<style></style>
