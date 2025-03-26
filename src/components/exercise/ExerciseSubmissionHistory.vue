<template>
  <div class="exercise-submission-history">
    <div class="header">
      <el-select v-model="submission" style="width: 8em;">
        <el-option v-for="item in submissions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-tooltip content="点击按钮查看详情">
        <el-button v-if="state == 'pass'" type="primary" :icon="SuccessFilled">结果正确</el-button>
        <el-button v-if="state == 'part'" type="info" :icon="WarnTriangleFilled">部分通过</el-button>
        <el-button v-if="state == 'compile'" type="info" :icon="WarnTriangleFilled">编译失败</el-button>
      </el-tooltip>
    </div>
    <ExerciseSubmissionHistoryEditor class="editor" editor-value="hello world" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SuccessFilled, WarnTriangleFilled } from '@element-plus/icons-vue';
import ExerciseSubmissionHistoryEditor from './ExerciseSubmissionHistoryEditor.vue';

const submission = ref('');
const submissions = ref([]);
const state = ref('pass')
</script>

<style scoped>
.exercise-submission-history {
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
