<template>
  <div class="exercise-submission-code">
    <div class="header">
      <el-select v-model="language" style="width: 8em;">
        <el-option v-for="item in languages" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button :loading="isSubmitting" @click="handleSubmitBtnClicked" :icon="UploadFilled" plain>提交</el-button>
    </div>
    <ExerciseSubmissionCodeEditor class="editor" ref="editorRef" :language="language" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';
import ExerciseSubmissionCodeEditor from './ExerciseSubmissionCodeEditor.vue';
import type { ExerciseSubmissionCodeEditorInstance } from './ExerciseSubmissionCodeEditor.vue';

const props = defineProps<{
  problemId?: string;
}>();

const emit = defineEmits<{
  (event: 'submitted'): void;
}>();

const languages = [
  { value: 'C', label: 'C' },
  { value: 'C++', label: 'C++' },
  { value: 'Java', label: 'Java' },
  { value: 'Python2', label: 'Python2' },
  { value: 'Python3', label: 'Python3' },
  { value: 'Go', label: 'Go' },
  { value: 'PHP', label: 'PHP' },
  { value: 'JavaScript', label: 'JavaScript' },
] as const;

const isSubmitting = ref(false);
const editorRef = ref<ExerciseSubmissionCodeEditorInstance>()
const language = ref<string>(languages[0].value);
const submissionId = ref<string>();

const handleSubmitBtnClicked = async () => {
  isSubmitting.value = true;
  const response = await axiosInstance.post(`/judge/problems/${props.problemId}/submit/`, {
    lang: language.value,
    src: editorRef.value?.getEditorValue(),
  });
  submissionId.value = String(response.data.submission_id);
  emit('submitted');
  isSubmitting.value = false;
};

// 加载最近一次提交的代码
const loadSubmission = async () => {
  const url = `/judge/problems/${props.problemId}/submissions/`;
  const response = await axiosInstance.get(url);
  if (response.data?.length > 0) {
    const submission = response.data[0];
    submissionId.value = String(submission.id);
    language.value = submission.lang;
    editorRef.value?.setEditorValue(submission.src);
  }
};

watch(() => props.problemId, () => {
  if (props.problemId) {
    loadSubmission();
  }
}, { immediate: true });

// 如果从未提交，则加载模板
watch(() => language.value, () => {
  if (!submissionId.value) {
    editorRef.value?.startWithTemplate();
  }
}, { immediate: true });

defineExpose({
  getSubmissionId: () => submissionId.value,
  getEditorValue: () => editorRef.value?.getEditorValue(),
  getLanguage: () => language.value,
});

export type ExerciseSubmissionCodeInstance = {
  getSubmissionId: () => string | undefined;
  getEditorValue: () => string | undefined;
  getLanguage: () => string | undefined;
};
</script>

<style scoped>
.exercise-submission-code {
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
