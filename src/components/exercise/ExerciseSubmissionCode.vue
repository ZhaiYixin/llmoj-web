<template>
  <div class="exercise-submission-code">
    <div class="header">
      <el-select v-model="language" style="width: 8em;">
        <el-option v-for="item in languages" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button :icon="UploadFilled" plain>提交</el-button>
    </div>
    <ExerciseSubmissionCodeEditor class="editor" :language="language" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue';
import ExerciseSubmissionCodeEditor from './ExerciseSubmissionCodeEditor.vue';

const languages = [
  {
    value: 'C',
    label: 'C',
  },
  {
    value: 'C++',
    label: 'C++',
  },
  {
    value: 'Java',
    label: 'Java',
  },
  {
    value: 'Python2',
    label: 'Python2',
  },
  {
    value: 'Python3',
    label: 'Python3',
  },
  {
    value: 'Go',
    label: 'Go',
  },
  {
    value: 'PHP',
    label: 'PHP',
  },
  {
    value: 'JavaScript',
    label: 'JavaScript',
  },
];
const language = ref(languages[0].value);

</script>

<style scoped>
.exercise-submission-code {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
}

.editor {
  margin-top: 10px;
  flex: 1;
}
</style>
