<template>
  <div class="exercise-problem">
    <div class="header">
      <el-input class="title" v-model="form.title" size="large" />
    </div>
    <TextEditor class="description" v-model="form.description" :readonly="false" />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import TextEditor from './TextEditor.vue';

const props = defineProps<{
  problem?: any;
}>();

const emit = defineEmits(['update:problem']);

const form = reactive({
  title: '',
  description: '',
});

watch(() => props.problem, () => {
  if (props.problem) {
    form.title = props.problem.title;
    form.description = props.problem.description;
  }
}, { immediate: true });

watch(form, () => {
  emit('update:problem', form);
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
