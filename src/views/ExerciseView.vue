<template>
  <ExercisePage :assignment-id="assignmentId" :problem-list-id="problemListId" :problem-id="problemId" :item-id="itemId"
    @update-item="handleUpdateItem" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ExercisePage from '@/components/exercise/ExercisePage.vue';

const route = useRoute();
const router = useRouter();

// assignmentId和problemListId和problemId至少要传入一个
const assignmentId = computed(() => route.query.assignment as string | undefined)
const problemListId = computed(() => route.query.list as string | undefined);
const problemId = computed(() => route.query.problem as string | undefined);
const itemId = computed(() => route.query.item as string | undefined);

const handleUpdateItem = (item_id: string, problem_id: string) => {
  router.replace({
    query: {
      ...route.query,
      item: item_id,
      problem: problem_id,
    },
  });
};
</script>

<style></style>
