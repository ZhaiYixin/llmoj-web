<template>
  <ResizableSplitPane>
    <template #left>
      <div style="height: 100%; position: relative;">
        <div class="floating-switch">
          <el-button v-if="readonly" @click="handleEditButtonClick" :icon="EditPen" text circle />
          <el-button-group v-else>
            <el-button @click="handleDeleteButtonClick" v-if="createNew || designedByMe" :icon="Delete" text circle />
            <el-button @click="handleUploadButtonClick" :icon="Upload" text circle />
          </el-button-group>
        </div>
        <ExerciseProblem v-if="readonly" :problem-list-id="props.problemListId" v-model:problem-id="problemId"
          :readonly="readonly" />
        <ExerciseProblemEdit v-else v-model:problem="problem" />
      </div>
    </template>
    <template #right>
      <ExerciseSubmission v-if="readonly" :problem-id="problemId" />
      <ExerciseSubmissionEdit v-else v-model:design="design" v-model:testcases="testcases" />
    </template>
  </ResizableSplitPane>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { EditPen, Upload, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { axiosInstance } from '@/services/http';
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import ExerciseProblemEdit from './exercise/ExerciseProblemEdit.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import ExerciseSubmissionEdit from './exercise/ExerciseSubmissionEdit.vue';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';

const props = defineProps<{
  problemListId?: string;
  problemId?: string | null;
}>();

const emit = defineEmits<{
  (event: 'update:problem-id', newVal?: string | null): void;
  (event: 'problem-deleted', problemId?: string | null): void;
}>();


const designedByMe = ref(false);
const problemId = ref(props.problemId);
const readonly = ref(true);
const problem = ref();
const design = ref();
const testcases = ref<Array<any>>();

let createNew = false;

const handleEditButtonClick = () => {
  readonly.value = false;
};

const handleDeleteButtonClick = async () => {
  let deleteMode = false;
  try {
    await ElMessageBox.confirm(
      '删除该题目之后，将无法再找回该题目相关的数据。',
      '删除？',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      }
    );
    deleteMode = true;
  } catch (e) {

  };
  if (deleteMode) {
    if (problemId.value) {
      const url = `/design/problems/${problemId.value}/`;
      const response = await axiosInstance.delete(url);
    }
    readonly.value = true;
    emit('problem-deleted', problemId.value);
  }
};

const handleUploadButtonClick = async () => {
  let saveMode = null;
  if (createNew) {
    try {
      await ElMessageBox.confirm(
        '保存该题目之后，您还可以继续修改。',
        '保存？',
        {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'info',
        }
      );
      saveMode = 'POST';
    } catch (e) {

    }
  } else if (designedByMe.value) {
    try {
      await ElMessageBox.confirm(
        '您需要修改并保存该题目，还是需要另存为一个新的题目？',
        '修改题目？',
        {
          distinguishCancelAndClose: true,
          confirmButtonText: '修改',
          cancelButtonText: '新建',
          type: 'info',
        }
      );
      saveMode = 'PUT';
    } catch (e) {
      saveMode = (e == 'close') ? null : 'POST';
    }
  } else {
    try {
      await ElMessageBox.confirm(
        '您没有权限修改其他老师的题目，是否另存为一个新的题目？',
        '创建题目？',
        {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
        }
      );
      saveMode = 'POST';
    } catch (e) {
      saveMode = null;
    }
  }
  if (saveMode == 'PUT') {
    const url = `/design/problems/${problemId.value}/`;
    const response = await axiosInstance.put(url, {
      problem: problem.value,
      design: design.value,
      testcases: testcases.value,
    });
    readonly.value = true;
  } else if (saveMode == 'POST') {
    const url = `/design/problems/`;
    const response = await axiosInstance.post(url, {
      problem: problem.value,
      design: design.value ? design.value : { is_public: false },
      testcases: testcases.value,
    });
    problemId.value = String(response.data.problem_id);
    readonly.value = true;
  }
};

const loadProblem = async (id: string) => {
  const response = await axiosInstance.get(`/design/problems/${id}/`);
  console.log(response.data);
  problem.value = response.data.problem;
  design.value = response.data.design;
  testcases.value = response.data.testcases;
  const userInfoResponse = await axiosInstance.get('/accounts/user-info/');
  const userInfo = userInfoResponse.data;
  designedByMe.value = design.value && design.value.designer.username == userInfo.username;
}

watch(() => props.problemId, (newVal) => {
  if (problemId.value !== newVal) {
    problemId.value = newVal;
  }
  if (problemId.value) {
    createNew = false;
    loadProblem(problemId.value);
  } else if (problemId.value === null) {
    createNew = true;
    readonly.value = false;
    problem.value = null;
    design.value = null;
    testcases.value = [];
  }
}, { immediate: true });

watch(problemId, (newVal) => {
  emit('update:problem-id', newVal);
});

</script>

<style scoped>
.floating-switch {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
  z-index: 1000;
}
</style>
