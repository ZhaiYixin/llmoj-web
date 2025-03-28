<template>
  <el-tabs v-model="activeTab" class="exercise-submission">
    <el-tab-pane name="code">
      <template #label>
        <el-icon>
          <CodeIcon />
        </el-icon>
        <span>代码</span>
      </template>
      <ExerciseSubmissionCode ref="codeRef" :problem-id="props.problemId" @submitted="handleSubmitted" />
    </el-tab-pane>
    <el-tab-pane name="test">
      <template #label>
        <el-icon>
          <CheckListIcon />
        </el-icon>
        <span>测试</span>
      </template>
      <ExerciseSubmissionTest ref="testRef" :problem-id="props.problemId" @testcase-clicked="handleTestCaseClicked"
        @result-clicked="handleTestCaseResultClicked" />
    </el-tab-pane>
    <el-tab-pane name="terminal">
      <template #label>
        <el-icon>
          <TerminalIcon />
        </el-icon>
        <span>运行</span>
      </template>
      <ExerciseSubmissionTerminal ref="terminalRef" :problem-id="props.problemId"
        @run-btn-clicked="handleTerminalRunBtnClicked" />
    </el-tab-pane>
    <el-tab-pane name="history">
      <template #label>
        <el-icon>
          <FolderChecked />
        </el-icon>
        <span>提交</span>
      </template>
      <ExerciseSubmissionHistory ref="historyRef" :problem-id="props.problemId"
        @detail-btn-clicked="handleHistoryDetailBtnClicked" />
    </el-tab-pane>
    <el-tab-pane name="answer">
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
import { ref, onMounted } from 'vue';
import { FolderChecked } from '@element-plus/icons-vue';
import CodeIcon from '../icons/IconCode.vue'
import CheckListIcon from '../icons/IconCheckList.vue'
import TerminalIcon from '../icons/IconTerminal.vue'
import QuestionIcon from '../icons/IconQuestion.vue'
import ExerciseSubmissionCode from './ExerciseSubmissionCode.vue';
import ExerciseSubmissionTest from './ExerciseSubmissionTest.vue';
import ExerciseSubmissionTerminal from './ExerciseSubmissionTerminal.vue';
import ExerciseSubmissionHistory from './ExerciseSubmissionHistory.vue';

const props = defineProps<{
  problemId: string | null;
}>();

const activeTab = ref('code')
const codeRef = ref(null);
const testRef = ref(null);
const terminalRef = ref(null);
const historyRef = ref(null);

const handleSubmitted = () => {
  activeTab.value = 'test';
  testRef.value.show(codeRef.value.getSubmissionId())
  historyRef.value.load()
}

const handleTestCaseClicked = (input: string, output: string) => {
  activeTab.value = 'terminal';
  terminalRef.value?.setInput(input);
  terminalRef.value?.setOutput(output);
}

const handleTestCaseResultClicked = async (input: string, output: string, src: string, lang: string) => {
  activeTab.value = 'terminal';
  terminalRef.value?.setInput(input);
  await terminalRef.value?.run(src, lang, output);
}

const handleTerminalRunBtnClicked = () => {
  terminalRef.value?.run(codeRef.value.getEditorValue(), codeRef.value.getLanguage());
}

const handleHistoryDetailBtnClicked = (submissionId: string) => {
  activeTab.value = 'test';
  testRef.value.show(submissionId)
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
