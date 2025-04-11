<template>
  <div class="screen">
    <AssignClassesAside class="aside" v-model:class-group-id="classGroupId" />
    <AssignClassesMain class="main" :class-group-id="classGroupId" @plus-button-click="handleAssignmentPlusButtonClick"
      @detail-button-click="handleAssignmentDetailButtonClick" @edit-button-click="handleAssignmentEditButtonClick" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AssignClassesAside from '@/components/teacher/assign/classes/AssignClassesAside.vue';
import AssignClassesMain from '@/components/teacher/assign/classes/AssignClassesMain.vue';

const props = defineProps<{
  classGroupId?: string;
}>();

const emit = defineEmits<{
  (event: 'update:class-group-id', newVal?: string): void;
  (event: 'create-button-click'): void;
  (event: 'edit-button-click', assignmentId: string): void;
  (event: 'detail-button-click', assignmentId: string): void;
}>();

const classGroupId = computed({
  get: () => props.classGroupId as string | undefined,
  set: (newVal: string | undefined) => {
    if (props.classGroupId !== newVal)
      emit('update:class-group-id', newVal);
  },
});

const handleAssignmentPlusButtonClick = () => {
  emit('create-button-click');
};

const handleAssignmentDetailButtonClick = (assignmentId: string) => {
  emit('detail-button-click', assignmentId);
};

const handleAssignmentEditButtonClick = (assignmentId: string) => {
  emit('edit-button-click', assignmentId);
}

</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  display: flex;
}

.main {
  flex: 1;
  height: 100%;
}

.buttons {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
}

.aside {
  width: 24em;
  height: 100%;
  border: var(--el-border);
}
</style>
