<template>
  <div class="exercise-submission-history">
    <div class="header">
      <el-select v-model="selectedSubmission" value-key="id" style="width: 12em;">
        <el-option v-for="item in submissions" :key="item.id" :label="formatDate(item.created_at)" :value="item" />
      </el-select>
      <el-tooltip content="点击按钮查看详情">
        <div>
          <el-button v-if="state == 'correct'" type="primary" :icon="SuccessFilled"
            @click="handleDetailBtnClicked">通过</el-button>
          <el-button v-if="state == 'part'" type="info" :icon="WarnTriangleFilled"
            @click="handleDetailBtnClicked">部分通过</el-button>
          <el-button v-if="state == 'wrong'" type="info" :icon="WarnTriangleFilled"
            @click="handleDetailBtnClicked">不通过</el-button>
          <el-button v-if="state == 'error'" type="info" :icon="WarnTriangleFilled"
            @click="handleDetailBtnClicked">编译失败</el-button>
        </div>
      </el-tooltip>
    </div>
    <ExerciseSubmissionHistoryEditor v-if="submissions.length" class="editor"
      :language="selectedSubmission?.lang || 'plaintext'" :editor-value="selectedSubmission?.src || ''" />
    <el-empty v-else description="暂无提交" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { SuccessFilled, WarnTriangleFilled } from '@element-plus/icons-vue';
import ExerciseSubmissionHistoryEditor from './ExerciseSubmissionHistoryEditor.vue';
import { axiosInstance } from '@/services/http';

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

export type Submission = {
  id: number;
  user: number;
  problem: number;
  src: string;
  lang: string;
  err: string | null;
  error_reason: string | null;
  created_at: string;
  updated_at: string;
};

const props = defineProps<{
  problemId: string | null;
}>();

const emit = defineEmits<{
  (event: 'detail-btn-clicked', submissionId: string): void;
}>();

const submissions = ref<Array<Submission>>([]);
const selectedSubmission = ref<Submission | null>(null);
const testCaseResults = ref<Array<TestCaseResult> | null>(null);
const state = ref<string | null>(null)

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const handleDetailBtnClicked = () => {
  if (selectedSubmission.value) {
    emit('detail-btn-clicked', String(selectedSubmission.value.id));
  }
}

const loadSubmissions = async () => {
  const url = `/judge/problems/${props.problemId}/submissions/`;
  const response = await axiosInstance.get(url);
  submissions.value = response.data;
};

const loadTestCaseResults = async (submission_id: number) => {
  const url = `/judge/problems/${props.problemId}/results/?submission_id=${submission_id}`;
  const response = await axiosInstance.get(url);
  testCaseResults.value = response.data;
};

const load = async () => {
  await loadSubmissions();
  if (submissions.value.length) {
    selectedSubmission.value = submissions.value[0];
  }
}

watch(selectedSubmission, async (newSubmission: Submission | null) => {
  if (newSubmission) {
    if (newSubmission.err) {
      state.value = 'error';
    } else {
      await loadTestCaseResults(newSubmission.id);
      if (testCaseResults.value) {
        const allPassed = testCaseResults.value.every(result => result.result === 0);
        const anyPassed = testCaseResults.value.some(result => result.result === 0);
        if (allPassed) {
          state.value = 'correct';
        } else if (anyPassed) {
          state.value = 'part';
        } else {
          state.value = 'wrong';
        }
      } else {
        state.value = null;
      }
    }
  } else {
    state.value = null;
  }
});

onMounted(() => {
  load();
});

defineExpose({ load });
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
