<template>
  <el-table class="exercise-submission-test" :data="tableData" :row-class-name="tableRowClass"
    @row-click="handleRowClick">
    <el-table-column prop="title" label="测试点" show-overflow-tooltip />
    <el-table-column prop="input" label="输入" show-overflow-tooltip />
    <el-table-column prop="output" label="预期输出" show-overflow-tooltip />
    <el-table-column v-if="showMode == 'testCaseResults'" prop="realOutput" label="实际输出" show-overflow-tooltip />
    <el-table-column v-if="showMode == 'testCaseResults'" prop="correct" label="">
      <template #default="scope">
        <el-icon v-if="scope.row.correct">
          <Check />
        </el-icon>
        <el-icon v-else>
          <Close />
        </el-icon>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { axiosInstance } from '@/services/http';
import { ref, onMounted } from 'vue';
import { Check, Close } from '@element-plus/icons-vue';

const props = defineProps<{
  problemId: string | null;
}>();

const emit = defineEmits<{
  (event: 'testcase-clicked', input: string, output: string): void;
  (event: 'result-clicked', input: string, output: string, src: string, lang: string): void;
}>();

export type TestCase = {
  id: number;
  ordinal: number;
  title: string;
  input: string;
  output: string;
};

export type TestCaseResult = {
  id: number;
  submission: number;
  test_case: number;
  cpu_time: number;
  result: number;
  memory: number;
  real_time: number;
  exit_code: number;
  error: number;
  output: string;
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

type TableRow = {
  id: number;
  ordinal: number;
  title: string;
  input: string;
  output: string;
  realOutput?: string;
  correct?: boolean;
};

const testCases = ref<Array<TestCase>>([]);
const tableData = ref<Array<TableRow>>([])
const submission = ref<{ src: string, lang: string, err: string, error_reason: string } | null>(null);
const testCaseResults = ref<Array<TestCaseResult>>([]);
const showMode = ref('testCases')

const tableRowClass = ({ row }: { row: TableRow }) => {
  return row.correct === false ? 'row-wrong' : 'row-default';
};

const handleRowClick = (row: TableRow) => {
  if (showMode.value == 'testCases') {
    emit('testcase-clicked', row.input, row.output);
  } else if (showMode.value == 'testCaseResults') {
    emit('result-clicked', row.input, row.output, submission.value!.src, submission.value!.lang);
  }
};

const loadTestCases = async () => {
  const response = await axiosInstance.get(`/judge/problems/${props.problemId}/testcases/`);
  if (response.data?.length > 0) {
    testCases.value = response.data;
  }
};

const loadSubmission = async (submissionId: string | null = null) => {
  const url = `/judge/problems/${props.problemId}/submissions/?${submissionId ? `submission_id=${submissionId}` : ''}`;
  const response = await axiosInstance.get(url);
  if (response.data?.length > 0) {
    submission.value = response.data[0];
  }
};

const loadTestCaseResults = async (submission_id: string) => {
  const response = await axiosInstance.get(`/judge/problems/${props.problemId}/results/?submission_id=${submission_id}`);
  if (response.data?.length > 0) {
    testCaseResults.value = response.data;
  }
};

const showTestCases = () => {
  tableData.value = testCases.value.map((testCase) => {
    return {
      id: testCase.id,
      ordinal: testCase.ordinal,
      title: testCase.title || `例${testCase.ordinal}`,
      input: testCase.input,
      output: testCase.output
    };
  });
  showMode.value = 'testCases';
};

const showTestCaseResults = () => {
  tableData.value = testCases.value.map((testCase) => {
    const r = testCaseResults.value.find((x) => x.test_case === testCase.id);
    return {
      id: testCase.id,
      ordinal: testCase.ordinal,
      title: testCase.title || `例${testCase.ordinal}`,
      input: testCase.input,
      output: testCase.output,
      realOutput: r === null ? '系统错误' :
        r === undefined ? '系统错误' :
          r.exit_code ? '返回值非零' :
            r.result === ResultCode.WRONG_ANSWER ? r.output || '空' :
              r.result === ResultCode.SUCCESS ? r.output :
                r.result === ResultCode.CPU_TIME_LIMIT_EXCEEDED ? '运行超时' :
                  r.result === ResultCode.REAL_TIME_LIMIT_EXCEEDED ? '运行超时' :
                    r.result === ResultCode.MEMORY_LIMIT_EXCEEDED ? '内存超限' :
                      r.result === ResultCode.RUNTIME_ERROR ? '运行时错误' :
                        r.result === ResultCode.SYSTEM_ERROR ? '系统错误' :
                          '系统错误',
      correct: r && r.result === ResultCode.SUCCESS,
    };
  });
  showMode.value = 'testCaseResults';
};

const showError = () => {
  tableData.value = testCases.value.map((testCase) => {
    return {
      id: testCase.id,
      ordinal: testCase.ordinal,
      title: testCase.title || `例${testCase.ordinal}`,
      input: testCase.input,
      output: testCase.output,
      realOutput: submission.value?.err || '',
      correct: false,
    };
  });
  showMode.value = 'testCaseResults';
};

const show = async (submissionId: string | null) => {
  if (submissionId) {
    await loadSubmission(submissionId);
    if (submission.value?.err) {
      showError();
    } else {
      await loadTestCaseResults(submissionId);
      showTestCaseResults();
    }
  } else {
    await loadTestCases();
    showTestCases();
  }
}

onMounted(async () => {
  await loadTestCases();
  showTestCases();
});

defineExpose({
  show
});
</script>

<style scoped>
.exercise-submission-test {
  height: 100%;
  width: 100%;
}

::v-deep(.row-wrong) {
  background-color: var(--el-color-info-light-9);
  cursor: pointer;
}

::v-deep(.row-default) {
  cursor: pointer;
}
</style>
