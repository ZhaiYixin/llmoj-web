<template>
  <div class="exercise-submission-terminal">
    <div class="header">
      <div />
      <el-button :loading="isRunning" @click="handleRunBtnClicked" :icon="CaretRight" plain>运行</el-button>
    </div>
    <ExerciseSubmissionTerminalTextarea class="input" v-model="input" :disabled="isRunning" />
    <el-alert class="output-title" v-if="outputTitle" :title="outputTitle" :closable="false" type="info" />
    <div class="output-content" v-loading="isRunning">
      <ExerciseSubmissionTerminalTextarea class="output" v-model="output" />
      <ExerciseSubmissionTerminalTextarea v-if="expectedOutput !== undefined" class="expected-output"
        v-model="expectedOutput" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CaretRight } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';
import ExerciseSubmissionTerminalTextarea from './ExerciseSubmissionTerminalTextarea.vue';
import type { RunResult, RunTestCaseResult, ErrType, Submission, TestCase, TestCaseResult } from '@/types/judge';


const props = defineProps<{
  problemId?: string;
}>();

const emit = defineEmits<{
  (event: 'run-btn-clicked'): void;
}>();

const isRunning = ref(false);
const input = ref('输入\n\n');
const outputTitle = ref<string>();
const output = ref('输出\n\n');
const expectedOutput = ref<string>();

const handleRunBtnClicked = () => {
  emit('run-btn-clicked');
}

const run = async (src: string, lang: string) => {
  isRunning.value = true;
  const response = await axiosInstance.post(`/judge/problems/${props.problemId}/run/`, {
    src: src,
    lang: lang,
    input: input.value,
    output: '',
  });
  showRunResult(response.data);
  isRunning.value = false;
};

const showRunResult = (result: RunResult) => {
  if (result.err) {
    showRunResultError(result.err, result.data as string);
  } else {
    showRunTestCaseResult(result.data as RunTestCaseResult);
  }
};

const showRunResultError = (err: ErrType, error_reason: string) => {
  outputTitle.value = err == 'CompileError' ? '编译失败！' : '系统错误！';
  output.value = error_reason;
  expectedOutput.value = undefined;
}

const showRunTestCaseResult = (r: RunTestCaseResult, testCaseOutput?: string) => {
  if (r.status == 'Accepted') {
    outputTitle.value = undefined;
    output.value = r.output;
    expectedOutput.value = undefined;
  } else if (r.status == 'WrongAnswer') {
    if (testCaseOutput === undefined) {
      outputTitle.value = undefined;
      output.value = r.output;
      expectedOutput.value = undefined;
    } else {
      outputTitle.value = '实际输出和预期输出不一致！';
      output.value = r.output;
      expectedOutput.value = testCaseOutput;
    }
  } else if (r.status == 'TimeLimitExceeded') {
    outputTitle.value = '运行超时！';
    output.value = r.message;
    expectedOutput.value = undefined;
  } else if (r.status == 'MemoryLimitExceeded') {
    outputTitle.value = '内存超限！';
    output.value = r.message;
    expectedOutput.value = undefined;
  } else if (r.status == 'RuntimeError') {
    outputTitle.value = '运行错误！';
    output.value = r.message;
    expectedOutput.value = undefined;
  } else if (r.status == 'SystemError') {
    outputTitle.value = '系统错误！';
    output.value = r.message;
    expectedOutput.value = undefined;
  }
};

const showTestCase = (testCase: TestCase) => {
  input.value = testCase.input;
  outputTitle.value = undefined;
  output.value = testCase.output;
};

const showTestCaseResult = (testCase: TestCase, submission: Submission, testCaseResult?: TestCaseResult) => {
  input.value = testCase.input;
  if (testCaseResult) {
    showRunTestCaseResult(testCaseResult, testCase.output);
  } else {
    showRunResultError(submission.status as ErrType, submission.message);
  }
};

defineExpose({
  run,
  showTestCase,
  showTestCaseResult,
});

export interface ExerciseSubmissionTerminalInstance {
  run: (src: string, lang: string) => Promise<void>;
  showTestCase: (testCase: TestCase) => void;
  showTestCaseResult: (testCase: TestCase, submission: Submission, testCaseResult?: TestCaseResult) => void;
}
</script>

<style scoped>
.exercise-submission-terminal {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
}

.input {
  flex: 1;
}

.output-title {
  flex-shrink: 0;
}

.output-content {
  flex: 1;
  display: flex;
}

.output {
  flex: 1;
}

.expected-output {
  flex: 1;
}
</style>
