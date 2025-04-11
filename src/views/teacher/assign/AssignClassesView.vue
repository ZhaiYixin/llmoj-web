<template>
  <AssignClasses v-model:class-group-id="classGroupId" @create-button-click="handleCreateButtonClick"
    @edit-button-click="handleEditButtonClick" @detail-button-click="handleDetailButtonClick" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AssignClasses from '@/components/teacher/assign/AssignClasses.vue';

const route = useRoute();
const router = useRouter();

const classGroupId = computed({
  get: () => route.query.classgroup as string | undefined,
  set: (newVal: string | undefined) => {
    router.replace({ query: { ...route.query, classgroup: newVal } });
  },
});

const handleCreateButtonClick = () => {
  router.push({ name: 'assign', query: { classgroup: classGroupId.value } });
};

const handleEditButtonClick = (assignmentId: string) => {
  router.push({ name: 'assign', query: { assignment: assignmentId } });
};

const handleDetailButtonClick = (assignmentId: string) => {
  router.push({ name: 'students', query: { assignment: assignmentId } });
};
</script>

<style scoped></style>
