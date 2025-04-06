<template>
  <div class="exercise-problem">
    <div class="header">
      <el-input class="title" v-model="form.title" size="large" />
    </div>
    <TextEditor class="description" v-model="form.description" :readonly="false" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TextEditor from '@/components/teacher/design/TextEditor.vue';

const props = defineProps<{
  problem?: any;
}>();

const emit = defineEmits(['update:problem']);

const form = computed({
  get: () => props.problem,
  set: (newVal) => {
    emit('update:problem', newVal);
  },
});

</script>

<style scoped>
.exercise-problem {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
}

.title {
  flex: 1;
  font: bold;
  font-size: large;
}

.description {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
