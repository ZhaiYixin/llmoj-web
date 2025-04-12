<template>
  <ResizableSplitPane>
    <template #left>
      <ExerciseProblem :assignment-id="props.assignmentId" :problem-list-id="props.problemListId"
        :problem-id="props.problemId" :item-id="props.itemId" @update-item="handleUpdateItem" />
    </template>
    <template #right>
      <ExerciseSubmission :assignment-id="props.assignmentId" :item-id="props.itemId" :problem-id="props.problemId" />
    </template>
  </ResizableSplitPane>
</template>

<script setup lang="ts">
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';

const props = defineProps<{
  problemId?: string;
  itemId?: string;
  problemListId?: string;
  assignmentId?: string;
}>();

const emit = defineEmits(['update-item']);

const handleUpdateItem = (item_id: string, problem_id: string) => {
  emit('update-item', item_id, problem_id);
};
</script>
