<template>
  <div class="exercise-submission-terminal">
    <div class="header">
      <div />
      <el-button :icon="CaretRight" plain :loading="isRunning" @click="handleRunBtnClicked">运行</el-button>
    </div>
    <ExerciseSubmissionTerminalTextarea class="input" v-model="input" />
    <el-alert class="output-title" v-if="outputTitle" :title="outputTitle" type="info" />
    <div class="output-wrapper">
      <ExerciseSubmissionTerminalTextarea class="output" v-model="output" />
      <ExerciseSubmissionTerminalTextarea v-if="expectedOutput !== null" class="expected-output"
        v-model="expectedOutput" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CaretRight } from '@element-plus/icons-vue';
import ExerciseSubmissionTerminalTextarea from './ExerciseSubmissionTerminalTextarea.vue';
import { axiosInstance } from '@/services/http';

type RunResult = {
  test_case: string,
  result: number;
  cpu_time: number;
  real_time: number;
  memory: number;
  output: string;
  output_md5: string;
  exit_code: number;
  signal: number;
  error: number;
};

enum ResultCode {
  WRONG_ANSWER = -1,
  SUCCESS = 0,
  CPU_TIME_LIMIT_EXCEEDED = 1,
  REAL_TIME_LIMIT_EXCEEDED = 2,
  MEMORY_LIMIT_EXCEEDED = 3,
  RUNTIME_ERROR = 4,
  SYSTEM_ERROR = 5,
}

enum ErrorCode {
  SUCCESS = 0,
  INVALID_CONFIG = -1,
  CLONE_FAILED = -2,
  PTHREAD_FAILED = -3,
  WAIT_FAILED = -4,
  ROOT_REQUIRED = -5,
  LOAD_SECCOMP_FAILED = -6,
  SETRLIMIT_FAILED = -7,
  DUP2_FAILED = -8,
  SETUID_FAILED = -9,
  EXECVE_FAILED = -10,
  SPJ_ERROR = -11,
}

const props = defineProps<{
  problemId: string | null;
}>();

const emit = defineEmits<{
  (event: 'run-btn-clicked'): void;
}>();

const isRunning = ref(false);
const input = ref('输入\n\n');
const outputTitle = ref('');
const output = ref('输出\n\n');
const expectedOutput = ref<string | null>(null);

const handleRunBtnClicked = () => {
  emit('run-btn-clicked');
}

const run = async (src: string, lang: string, expected: string | null = null) => {
  isRunning.value = true;
  const response = await axiosInstance.post(`/judge/problems/${props.problemId}/run/`, {
    src: src,
    lang: lang,
    input: input.value,
    output: expected ? expected : '',
  });
  expectedOutput.value = null;
  if (response.data.err) {
    outputTitle.value = '编译失败！';
    output.value = response.data.data;
  } else {
    const r = response.data.data[0] as RunResult;
    if (r.result == ResultCode.SUCCESS) {
      outputTitle.value = '';
      output.value = r.output;
    } else if (r.result == ResultCode.WRONG_ANSWER) {
      if (expected === null) {
        outputTitle.value = '';
        output.value = r.output;
      } else {
        outputTitle.value = '实际输出和预期输出不一致！';
        output.value = r.output;
        expectedOutput.value = expected;
      }
    } else if (r.result == ResultCode.CPU_TIME_LIMIT_EXCEEDED) {
      outputTitle.value = '运行超时！';
      output.value = `${r.cpu_time}ms`;
    } else if (r.result == ResultCode.REAL_TIME_LIMIT_EXCEEDED) {
      outputTitle.value = '运行超时！';
      output.value = `${r.real_time}ms`;
    } else if (r.result == ResultCode.MEMORY_LIMIT_EXCEEDED) {
      outputTitle.value = '内存超限！';
      output.value = `${r.memory}byte`;
    } else if (r.result == ResultCode.RUNTIME_ERROR) {
      outputTitle.value = '运行时错误！';
      output.value = `exit code: ${r.exit_code}\nsignal: ${r.signal}\noutput: ${r.output}`;
    } else if (r.result == ResultCode.SYSTEM_ERROR) {
      outputTitle.value = '系统错误！';
      output.value = `error code: ${r.error}`;
    }
  }
  isRunning.value = false;
};

defineExpose({
  setInput(newInput: string) {
    input.value = newInput;
  },
  setOutput(newOutput: string) {
    output.value = newOutput;
  },
  run,
});
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

.output-wrapper {
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
