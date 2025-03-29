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
import { ResultCode, ErrorCode } from '@/types/judge';
import type { RunResult, RunTestCaseResult, Submission, TestCase, TestCaseResult } from '@/types/judge';


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
    showRunError(result.err, result.data as string);
  } else {
    const r = (result.data as Array<RunTestCaseResult>)[0];
    showRunTestCaseResult(
      r.result,
      r.output,
      undefined,
      r.cpu_time,
      r.real_time,
      r.memory,
      r.exit_code,
      r.signal,
      r.error
    );
  }
};

const showRunError = (err: string, error_reason: string) => {
  outputTitle.value = '编译失败！';
  output.value = error_reason;
  expectedOutput.value = undefined;
}

const showRunTestCaseResult = (
  result: ResultCode,
  realOutput: string,
  testCaseOutput?: string,
  cpu_time?: number,
  real_time?: number,
  memory?: number,
  exit_code?: number,
  signal?: number,
  error?: ErrorCode,
) => {
  const resultHandlers: Record<ResultCode, () => void> = {
    [ResultCode.SUCCESS]: () => {
      outputTitle.value = undefined;
      output.value = realOutput;
      expectedOutput.value = undefined;
    },
    [ResultCode.WRONG_ANSWER]: () => {
      if (testCaseOutput === undefined) {
        outputTitle.value = undefined;
        output.value = realOutput;
        expectedOutput.value = undefined;
      } else {
        outputTitle.value = '实际输出和预期输出不一致！';
        output.value = realOutput;
        expectedOutput.value = testCaseOutput;
      }
    },
    [ResultCode.CPU_TIME_LIMIT_EXCEEDED]: () => {
      outputTitle.value = '运行超时！';
      output.value = `${cpu_time}ms`;
      expectedOutput.value = undefined;
    },
    [ResultCode.REAL_TIME_LIMIT_EXCEEDED]: () => {
      outputTitle.value = '运行超时！';
      output.value = `${real_time}ms`;
      expectedOutput.value = undefined;
    },
    [ResultCode.MEMORY_LIMIT_EXCEEDED]: () => {
      outputTitle.value = '内存超限！';
      output.value = `${memory}byte`;
      expectedOutput.value = undefined;
    },
    [ResultCode.RUNTIME_ERROR]: () => {
      outputTitle.value = '运行时错误！';
      output.value = `exit code: ${exit_code}\nsignal: ${signal}\noutput: ${realOutput}`;
      expectedOutput.value = undefined;
    },
    [ResultCode.SYSTEM_ERROR]: () => {
      outputTitle.value = '系统错误！';
      output.value = `error code: ${error}`;
      expectedOutput.value = undefined;
    },
  };
  resultHandlers[result]?.();
};

const showTestCase = (testCase: TestCase) => {
  input.value = testCase.input;
  outputTitle.value = undefined;
  output.value = testCase.output;
};

const showTestCaseResult = (testCase: TestCase, submission: Submission, testCaseResult?: TestCaseResult) => {
  input.value = testCase.input;
  if (testCaseResult) {
    showRunTestCaseResult(
      testCaseResult.result,
      testCaseResult.output,
      testCase.output,
      testCaseResult.cpu_time,
      testCaseResult.real_time,
      testCaseResult.memory,
      testCaseResult.exit_code,
      testCaseResult.signal,
      testCaseResult.error
    );
  } else {
    showRunError(submission.err as string, submission.error_reason as string);
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
