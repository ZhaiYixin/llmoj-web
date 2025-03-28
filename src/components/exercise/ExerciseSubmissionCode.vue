<template>
  <div class="exercise-submission-code">
    <div class="header">
      <el-select v-model="language" style="width: 8em;">
        <el-option v-for="item in languages" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button :icon="UploadFilled" plain @click="handleSubmit" :loading="isSubmitting">提交</el-button>
    </div>
    <ExerciseSubmissionCodeEditor ref="editorRef" class="editor" :language="language" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import ExerciseSubmissionCodeEditor from './ExerciseSubmissionCodeEditor.vue';
import { axiosInstance } from '@/services/http';

const props = defineProps<{
  problemId: string | null;
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
];

const language = ref(languages[0].value);
const editorRef = ref<{ getEditorValue: () => string; setEditorValue: (value: string) => void } | null>(null);
const isSubmitting = ref(false);
const submission_id = ref<string | null>(null);

const loadSubmission = async (submissionId: string | null = null) => {
  const url = `/judge/problems/${props.problemId}/submissions/?${submissionId ? `submission_id=${submissionId}` : ''}`;
  const response = await axiosInstance.get(url);
  if (response.data?.length > 0) {
    const submission = response.data[0];
    submission_id.value = submission.id;
    language.value = submission.lang;
    editorRef.value?.setEditorValue(submission.src);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  const response = await axiosInstance.post(`/judge/problems/${props.problemId}/submit/`, {
    lang: language.value,
    src: editorRef.value?.getEditorValue(),
  });
  submission_id.value = response.data.submission_id;
  emit('submitted');
  isSubmitting.value = false;
};

const getSubmissionId = () => {
  return submission_id.value;
}

const getEditorValue = () => {
  return editorRef.value?.getEditorValue() || '';
};

const getLanguage = () => {
  return language.value;
}

defineExpose({
  getSubmissionId,
  getEditorValue,
  getLanguage,
});

onMounted(() => {
  loadSubmission();
});
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
