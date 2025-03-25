<template>
  <el-tabs v-model="activeName" class="exercise-submission" @tab-click="handleClick">
    <el-tab-pane name="first">
      <template #label>
        <el-icon>
          <CodeIcon />
        </el-icon>
        <span>代码</span>
      </template>
      <ExerciseSubmissionCode />
    </el-tab-pane>
    <el-tab-pane name="second">
      <template #label>
        <el-icon>
          <TerminalIcon />
        </el-icon>
        <span>测试</span>
      </template>
      <ExerciseSubmissionTest />
    </el-tab-pane>
    <el-tab-pane name="third">
      <template #label>
        <el-icon>
          <QuestionIcon />
        </el-icon>
        <span>答案</span>
      </template>
      Role</el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TabsPaneContext } from 'element-plus';
import CodeIcon from '../icons/IconCode.vue'
import TerminalIcon from '../icons/IconTerminal.vue'
import QuestionIcon from '../icons/IconQuestion.vue'
import ExerciseSubmissionCode from './ExerciseSubmissionCode.vue';
import ExerciseSubmissionTest from './ExerciseSubmissionTest.vue';

const activeName = ref('first')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
</script>

<style scoped>
.exercise-submission {
  padding: 16px;
  height: 100%;
}

.exercise-submission .el-tab-pane {
  height: 100%;
}
</style>
