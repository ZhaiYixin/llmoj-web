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
import { ref, watch } from 'vue';
import { Check, Close } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';
import type { TestCase, TestCaseResult, Submission, ErrType } from '@/types/judge';

const props = defineProps<{
  problemId: string | undefined;
}>();

const emit = defineEmits<{
  (event: 'testcase-clicked', testCase: TestCase): void;
  (event: 'result-clicked', testCase: TestCase, submission: Submission, testCaseResult: TestCaseResult): void;
}>();

type TableRow = {
  id: number;
  ordinal: number;
  title: string;
  input: string;
  output: string;
  realOutput?: string;
  correct?: boolean;
};

const tableData = ref<Array<TableRow>>([])
const showMode = ref('testCases')
const testCases = ref<Array<TestCase>>([]);
const submission = ref<Submission>();
const testCaseResults = ref<Array<TestCaseResult>>([]);

const tableRowClass = ({ row }: { row: TableRow }) => {
  return row.correct === false ? 'row-wrong' : 'row-default';
};

const handleRowClick = (row: TableRow) => {
  const testCase = testCases.value.find(tc => tc.id === row.id);
  if (showMode.value == 'testCases') {
    emit('testcase-clicked', testCase as TestCase);
  } else if (showMode.value == 'testCaseResults') {
    const testCaseResult = testCaseResults.value.find(result => result.test_case === row.id);
    emit('result-clicked', testCase as TestCase, submission.value as Submission, testCaseResult as TestCaseResult);
  }
};

const loadTestCases = async () => {
  const response = await axiosInstance.get(`/judge/problems/${props.problemId}/testcases/`);
  if (response.data?.length > 0) {
    testCases.value = response.data;
  } else {
    testCases.value = [];
  }
};

const loadSubmission = async (submissionId: string) => {
  const url = `/judge/problems/${props.problemId}/submissions/?submission_id=${submissionId}`;
  const response = await axiosInstance.get(url);
  if (response.data?.length > 0) {
    submission.value = response.data[0];
  }
};

const loadTestCaseResults = async (submissionId: string) => {
  const response = await axiosInstance.get(`/judge/problems/${props.problemId}/results/?submission_id=${submissionId}`);
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
    const s = r?.status;
    return {
      id: testCase.id,
      ordinal: testCase.ordinal,
      title: testCase.title || `例${testCase.ordinal}`,
      input: testCase.input,
      output: testCase.output,
      realOutput:
        s == 'Accepted' ? r!.output :
          s == 'WrongAnswer' ? r!.output :
            s == 'TimeLimitExceeded' ? '运行超时' :
              s == 'MemoryLimitExceeded' ? '内存超限' :
                s == 'RuntimeError' ? '运行错误' :
                  s == 'SystemError' ? '后台错误' : '系统错误',
      correct: s == 'Accepted',
    };
  });
  showMode.value = 'testCaseResults';
};

const showError = (s?: ErrType) => {
  tableData.value = testCases.value.map((testCase) => {
    return {
      id: testCase.id,
      ordinal: testCase.ordinal,
      title: testCase.title || `例${testCase.ordinal}`,
      input: testCase.input,
      output: testCase.output,
      realOutput: s == 'CompileError' ? '编译失败' : '系统错误',
      correct: false,
    };
  });
  showMode.value = 'testCaseResults';
};

const show = async (submissionId?: string) => {
  if (submissionId) {
    await loadSubmission(submissionId);
    const s = submission.value?.status;
    if (s == 'Accepted' || s == 'PartiallyAccepted' || s == 'WrongAnswer') {
      await loadTestCaseResults(submissionId);
      showTestCaseResults();
    } else {
      showError(s);
    }
  } else {
    await loadTestCases();
    showTestCases();
  }
}

watch(() => props.problemId, async () => {
  if (props.problemId) {
    show();
  }
}, { immediate: true });

defineExpose({
  show,
});

export type ExerciseSubmissionTestInstance = {
  show: (submissionId?: string) => Promise<void>;
};
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
