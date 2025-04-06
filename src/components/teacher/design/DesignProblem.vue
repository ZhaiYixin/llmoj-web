<template>
  <ResizableSplitPane>
    <template #left>
      <div style="height: 100%; position: relative;">
        <ExerciseProblem v-if="readonly" :problem-list-id="props.problemListId" v-model:problem-id="problemId" />
        <DesignProblemLeft v-else v-model:problem="problem" />
        <div class="buttons">
          <el-button v-if="readonly" @click="handleEditButtonClick" :icon="EditPen" text circle />
          <el-button-group v-else>
            <el-button @click="handleDeleteButtonClick" v-if="designedByMe" :icon="Delete" text circle />
            <el-button @click="handleUploadButtonClick" :icon="Upload" text circle />
          </el-button-group>
        </div>
      </div>
    </template>
    <template #right>
      <ExerciseSubmission v-if="readonly" :problem-id="problemId" />
      <DesignProblemRight v-else v-model:design="design" v-model:testcases="testcases" />
    </template>
  </ResizableSplitPane>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage, ElMessageBox, type Action } from 'element-plus';
import { EditPen, Upload, Delete } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { axiosInstance } from '@/services/http';
import ResizableSplitPane from '@/components/exercise/ResizableSplitPane.vue';
import ExerciseProblem from '@/components/exercise/ExerciseProblem.vue';
import DesignProblemLeft from '@/components/teacher/design/problem/DesignProblemLeft.vue';
import ExerciseSubmission from '@/components/exercise/ExerciseSubmission.vue';
import DesignProblemRight from '@/components/teacher/design/problem/DesignProblemRight.vue';

const props = defineProps<{
  problemListId?: string;
  problemId?: string;
}>();

const emit = defineEmits<{
  (event: 'update:problem-id', newVal?: string): void;
}>();

const userStore = useUserStore();

const readonly = ref(true);
const problem = ref();
const design = ref();
const testcases = ref<Array<any>>([]);

const problemId = computed({
  get: () => props.problemId as string | undefined,
  set: (newVal: string | undefined) => {
    if (problemId.value !== newVal)
      emit('update:problem-id', newVal);
  },
});
const createNew = computed(() => !props.problemListId && !problemId.value);
const designedByMe = computed(() => design.value && design.value.designer && design.value.designer.username == userStore.info.username);

const handleEditButtonClick = () => {
  readonly.value = false;
};

const handleDeleteButtonClick = async () => {
  ElMessageBox.confirm('删除该题目之后，将无法再找回该题目相关的数据。', '删除题目？', { confirmButtonText: '是', cancelButtonText: '否', type: 'warning', }).then(async () => {
    const url = `/design/problems/${problemId.value}/`;
    await axiosInstance.delete(url);
    ElMessage({ type: 'success', message: '删除成功' });
    problemId.value = undefined;
  }).catch(() => { });
};

const handleUploadButtonClick = async () => {
  if (createNew.value) {
    ElMessageBox.confirm('创建该题目之后，您还可以继续修改。', '创建题目？', { confirmButtonText: '是', cancelButtonText: '否', type: 'info' }).then(async () => {
      const response = await saveProblem('post');
      ElMessage({ type: 'success', message: '新建成功' });
      problemId.value = String(response.data.problem_id);
      readonly.value = true;
    }).catch(() => { });
  } else if (designedByMe.value) {
    ElMessageBox.confirm('您是需要修改并保存该题目，还是需要创建并保存为一个新的题目？', '修改题目？', { distinguishCancelAndClose: true, confirmButtonText: '修改', cancelButtonText: '新建', type: 'info' }).then(async () => {
      await saveProblem('put');
      ElMessage({ type: 'success', message: '修改成功' });
      readonly.value = true;
    }).catch(async (action: Action) => {
      if (action == 'cancel') {
        const response = await saveProblem('post');
        ElMessage({ type: 'success', message: '新建成功' });
        problemId.value = String(response.data.problem_id);
        readonly.value = true;
      }
    });
  } else {
    ElMessageBox.confirm('您没有权限修改其他老师的题目，是否创建并保存为一个新的题目？', '创建题目？', { distinguishCancelAndClose: true, confirmButtonText: '新建', cancelButtonText: '放弃更改', type: 'warning' }).then(async () => {
      const response = await saveProblem('post');
      ElMessage({ type: 'success', message: '新建成功' });
      problemId.value = String(response.data.problem_id);
      readonly.value = true;
    }).catch(async (action: Action) => {
      if (action == 'cancel') {
        await loadProblem();
        readonly.value = true;
      }
    });
  }
};

const saveProblem = async (method: 'post' | 'put') => {
  const url = (method == 'post') ? `/design/problems/` : `/design/problems/${problemId.value}/`;
  return await axiosInstance[method](url, {
    problem: problem.value,
    design: design.value,
    testcases: testcases.value,
  });
};

const loadProblem = async () => {
  const response = await axiosInstance.get(`/design/problems/${problemId.value}/`);
  problem.value = response.data.problem;
  design.value = response.data.design;
  testcases.value = response.data.testcases;
};

const clearProblem = () => {
  problem.value = { title: '', description: '' };
  design.value = { is_public: false };
  testcases.value = [];
};

watch(problemId, () => {
  if (problemId.value) {
    loadProblem();
  }
}, { immediate: true });

watch(createNew, () => {
  if (createNew.value) {
    clearProblem();
    readonly.value = false;
  }
}, { immediate: true });

userStore.fetchInfo();

</script>

<style scoped>
.buttons {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
}
</style>
