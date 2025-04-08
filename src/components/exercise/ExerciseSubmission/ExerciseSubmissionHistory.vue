<template>
  <div class="exercise-submission-history">
    <div class="header">
      <el-select v-model="selectedSubmission" value-key="id" style="width: 12em;">
        <el-option v-for="item in submissions" :key="item.id" :label="dayjs(item.created_at).format('MM-DD HH:mm')"
          :value="item" />
      </el-select>
      <el-tooltip v-if="selectedSubmission" content="点击按钮查看详情">
        <el-button v-if="selectedSubmission.status == 'Accepted'" @click="handleDetailBtnClicked" type="primary"
          :icon="SuccessFilled">通过</el-button>
        <el-button v-else-if="selectedSubmission.status == 'PartiallyAccepted'" @click="handleDetailBtnClicked"
          type="info" :icon="WarnTriangleFilled">部分通过</el-button>
        <el-button v-else-if="selectedSubmission.status == 'WrongAnswer'" @click="handleDetailBtnClicked" type="info"
          :icon="WarnTriangleFilled">不通过</el-button>
        <el-button v-else-if="selectedSubmission.status == 'CompileError'" @click="handleDetailBtnClicked" type="info"
          :icon="WarnTriangleFilled">编译失败</el-button>
        <el-button v-else @click="handleDetailBtnClicked" type="info" :icon="WarnTriangleFilled">系统错误</el-button>
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
import dayjs from 'dayjs';
import type { Submission } from '@/types/judge'

const props = defineProps<{
  problemId?: string;
}>();

const emit = defineEmits<{
  (event: 'detail-btn-clicked', submissionId: string): void;
}>();

const submissions = ref<Array<Submission>>();
const selectedSubmission = ref<Submission>();

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
