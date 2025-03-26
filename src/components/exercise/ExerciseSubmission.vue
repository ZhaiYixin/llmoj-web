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
          <CheckListIcon />
        </el-icon>
        <span>测试</span>
      </template>
      <ExerciseSubmissionTest />
    </el-tab-pane>
    <el-tab-pane name="third">
      <template #label>
        <el-icon>
          <TerminalIcon />
        </el-icon>
        <span>运行</span>
      </template>
      <ExerciseSubmissionTerminal />
    </el-tab-pane>
    <el-tab-pane name="forth">
      <template #label>
        <el-icon>
          <FolderChecked />
        </el-icon>
        <span>提交</span>
      </template>
      <ExerciseSubmissionHistory />
    </el-tab-pane>
    <el-tab-pane name="five">
      <template #label>
        <el-icon>
          <QuestionIcon />
        </el-icon>
        <span>答案</span>
      </template>
      TODO
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TabsPaneContext } from 'element-plus';
import { FolderChecked } from '@element-plus/icons-vue';
import CodeIcon from '../icons/IconCode.vue'
import CheckListIcon from '../icons/IconCheckList.vue'
import TerminalIcon from '../icons/IconTerminal.vue'
import QuestionIcon from '../icons/IconQuestion.vue'
import ExerciseSubmissionCode from './ExerciseSubmissionCode.vue';
import ExerciseSubmissionTest from './ExerciseSubmissionTest.vue';
import ExerciseSubmissionTerminal from './ExerciseSubmissionTerminal.vue';
import ExerciseSubmissionHistory from './ExerciseSubmissionHistory.vue';

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
