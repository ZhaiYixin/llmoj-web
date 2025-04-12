<template>
  <AssignStudents :assignmentId="assignmentId" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AssignStudents from '@/components/teacher/assign/AssignStudents.vue';

const route = useRoute();

const assignmentId = computed(() => route.query.assignment as string | undefined);

</script>

<style scoped></style>
