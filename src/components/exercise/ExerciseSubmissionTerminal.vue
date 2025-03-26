<template>
  <div class="exercise-submission-terminal">
    <div class="header">
      <div />
      <el-button :icon="CaretRight" plain>运行</el-button>
    </div>
    <ExerciseSubmissionTerminalEditor class="input" v-model="input" />
    <ExerciseSubmissionTerminalEditor class="output" v-model="output" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CaretRight } from '@element-plus/icons-vue';
import ExerciseSubmissionTerminalEditor from './ExerciseSubmissionTerminalEditor.vue';

const input = ref('输入\n');
const output = ref('输出\n');
</script>

<style scoped>
.exercise-submission-terminal {
  height: 100%;
  display: flex;
  flex-direction: column;
}


.header {
  display: flex;
  justify-content: space-between;
}

.input {
  margin-top: 10px;
  flex: 1;
}

.output {
  margin-top: 10px;
  flex: 1;
}
</style>
