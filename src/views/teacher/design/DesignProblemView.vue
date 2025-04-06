<template>
  <DesignProblem :problem-list-id="problemListId" v-model:problem-id="problemId" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DesignProblem from '@/components/teacher/design/DesignProblem.vue';

const route = useRoute();
const router = useRouter();

// 若既无problemListId又无problemId，则表示新建题目
const problemListId = computed(() => route.query.exercise as string | undefined);
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

<style scoped></style>
