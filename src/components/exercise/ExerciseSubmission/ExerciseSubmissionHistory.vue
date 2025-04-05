<template>
  <div class="exercise-submission-history">
    <div class="header">
      <el-select v-model="selectedSubmission" value-key="id" style="width: 12em;">
        <el-option v-for="item in submissions" :key="item.id" :label="formatDate(item.created_at)" :value="item" />
      </el-select>
      <el-tooltip content="点击按钮查看详情">
        <el-button v-if="state == 'correct'" @click="handleDetailBtnClicked" type="primary"
          :icon="SuccessFilled">通过</el-button>
        <el-button v-else-if="state == 'part'" @click="handleDetailBtnClicked" type="info"
          :icon="WarnTriangleFilled">部分通过</el-button>
        <el-button v-else-if="state == 'wrong'" @click="handleDetailBtnClicked" type="info"
          :icon="WarnTriangleFilled">不通过</el-button>
        <el-button v-else-if="state == 'error'" @click="handleDetailBtnClicked" type="info"
          :icon="WarnTriangleFilled">编译失败</el-button>
        <div v-else />
      </el-tooltip>
    </div>
    <CodeEditor class="editor" v-if="selectedSubmission" :language="selectedSubmission.lang"
      v-model="selectedSubmission.src" readonly />
    <el-empty v-else description="暂无提交" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { axiosInstance } from '@/services/http';
import { SuccessFilled, WarnTriangleFilled } from '@element-plus/icons-vue';
import CodeEditor from './CodeEditor.vue';
import type { Submission, TestCaseResult } from '@/types/judge'

const props = defineProps<{
  problemId?: string;
}>();

const emit = defineEmits<{
  (event: 'detail-btn-clicked', submissionId: string): void;
}>();

const submissions = ref<Array<Submission>>();
const selectedSubmission = ref<Submission>();
const testCaseResults = ref<Array<TestCaseResult>>();
const state = ref<string>();

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

const load = async () => {
  await loadSubmissions();
  if (submissions.value?.length) {
    selectedSubmission.value = submissions.value[0];
  } else {
    selectedSubmission.value = undefined;
  }
}

const loadTestCaseResults = async (submission_id: number) => {
  const url = `/judge/problems/${props.problemId}/results/?submission_id=${submission_id}`;
  const response = await axiosInstance.get(url);
  testCaseResults.value = response.data;
};

const showResultState = async (submission?: Submission) => {
  if (submission) {
    if (submission.err) {
      state.value = 'error';
    } else {
      await loadTestCaseResults(submission.id);
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
        state.value = undefined;
      }
    }
  } else {
    state.value = undefined;
  }
}

watch(selectedSubmission, async (newSubmission?: Submission) => {
  showResultState(newSubmission);
});

watch(() => props.problemId, () => {
  if (props.problemId) {
    load();
  }
}, { immediate: true });

defineExpose({ load });

export interface ExerciseSubmissionHistoryInstance {
  load: () => Promise<void>;
}
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
