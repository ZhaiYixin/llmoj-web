<template>
  <div class="screen">
    <el-scrollbar class="aside">
      <DesignExerciseAside v-model:problem-list="problemList" v-model:items="items" :readonly="readonly"
        @item-click="handleExerciseProblemClick" @plus-button-click="handleExercisePlusButtonClick" />
      <div class="buttons">
        <el-button v-if="readonly" @click="handleEditButtonClick" :icon="EditPen" text circle />
        <el-button-group v-else>
          <el-button @click="handleDeleteButtonClick" v-if="designedByMe" :icon="Delete" text circle />
          <el-button @click="handleUploadButtonClick" :icon="Upload" text circle />
        </el-button-group>
      </div>
    </el-scrollbar>
    <div class="main">
      <SearchProblem ref="searchProblemRef" :selectable="!readonly"
        @plus-button-click="handleSearchProblemPlusButtonClick" @row-click="handleSearchProblemRowClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox, type Action } from 'element-plus';
import { EditPen, Upload, Delete } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import { axiosInstance } from '@/services/http';
import DesignExerciseAside from '@/components/teacher/design/exercise/DesignExerciseAside.vue';
import SearchProblem from '@/components/teacher/design/SearchProblem.vue';

const props = defineProps<{
  problemListId?: string;
}>();

const emit = defineEmits<{
  (event: 'update:problem-list-id', newVal?: string): void;
  (event: 'problem-click', problemId: string): void;
  (event: 'problem-create-button-click'): void;
}>();

const userStore = useUserStore();

const readonly = ref(true);
const problemList = ref({
  title: '',
  description: '',
  is_public: false,
});
const designer = ref();
const items = ref<Array<any>>([]);
const searchProblemRef = ref();

const problemListId = computed({
  get: () => props.problemListId as string | undefined,
  set: (newVal: string | undefined) => {
    if (problemListId.value !== newVal)
      emit('update:problem-list-id', newVal);
  },
});
const createNew = computed(() => !problemListId.value);
const designedByMe = computed(() => designer.value && designer.value.username == userStore.info.username);

const handleEditButtonClick = () => {
  readonly.value = false;
};

const handleDeleteButtonClick = () => {
  ElMessageBox.confirm('删除该题目集之后，将无法再找回该题目集相关的数据。', '删除题目集？', { confirmButtonText: '是', cancelButtonText: '否', type: 'warning', }).then(async () => {
    const url = `/design/problem-lists/${problemListId.value}/`;
    await axiosInstance.delete(url);
    ElMessage({ type: 'success', message: '删除成功' });
    problemListId.value = undefined;
  }).catch(() => { });
}

const handleUploadButtonClick = async () => {
  if (createNew.value) {
    ElMessageBox.confirm('创建该题目集之后，您还可以继续修改。', '创建题目集？', { confirmButtonText: '是', cancelButtonText: '否', type: 'info' }).then(async () => {
      const response = await saveProblemList('post');
      ElMessage({ type: 'success', message: '新建成功' });
      problemListId.value = response.data.problem_list_id;
      readonly.value = true;
    }).catch(() => { });
  } else if (designedByMe.value) {
    ElMessageBox.confirm('您是需要修改并保存该题目集，还是需要创建并保存为一个新的题目集？', '修改题目集？', { distinguishCancelAndClose: true, confirmButtonText: '修改', cancelButtonText: '新建', type: 'info' }).then(async () => {
      await saveProblemList('put');
      ElMessage({ type: 'success', message: '修改成功' });
      readonly.value = true;
    }).catch(async (action: Action) => {
      if (action == 'cancel') {
        const response = await saveProblemList('post');
        ElMessage({ type: 'success', message: '新建成功' });
        problemListId.value = response.data.problem_list_id;
        readonly.value = true;
      }
    });
  } else {
    ElMessageBox.confirm('您没有权限修改其他老师的题目集，是否创建并保存为一个新的题目集？', '创建题目集？', { distinguishCancelAndClose: true, confirmButtonText: '新建', cancelButtonText: '放弃更改', type: 'warning' }).then(async () => {
      const response = await saveProblemList('post');
      ElMessage({ type: 'success', message: '新建成功' });
      problemListId.value = response.data.problem_list_id;
      readonly.value = true;
    }).catch(async (action: Action) => {
      if (action == 'cancel') {
        await loadProblemList();
        readonly.value = true;
      }
    });
  }
};

const handleExerciseProblemClick = (p) => {
  emit('problem-click', p.id);
};

const handleExercisePlusButtonClick = () => {
  const problems = searchProblemRef.value.getSelectionRows();
  items.value = items.value.concat(problems);
  searchProblemRef.value.clearSelection();
};

const handleSearchProblemPlusButtonClick = () => {
  emit('problem-create-button-click');
};

const handleSearchProblemRowClick = (p) => {
  emit('problem-click', p.id);
};

const saveProblemList = async (method: 'post' | 'put') => {
  const url = (method == 'post') ? `/design/problem-lists/` : `/design/problem-lists/${problemListId.value}/`;
  return await axiosInstance[method](url, {
    problem_list: problemList.value,
    items: items.value.map((p) => ({ problem_id: p.id })),
  });
};

const loadProblemList = async () => {
  const url = `/design/problem-lists/${problemListId.value}/`;
  const response = await axiosInstance.get(url);
  problemList.value = {
    title: response.data.problem_list.title,
    description: response.data.problem_list.description,
    is_public: response.data.problem_list.is_public,
  };
  designer.value = response.data.problem_list.designer;
  items.value = response.data.items.filter((p) => p.problem).map((p) => {
    return {
      id: String(p.problem.id),
      title: p.problem.title,
      description: p.problem.description,
    };
  });
};

const clearProblemList = () => {
  problemList.value = {
    title: '',
    description: '',
    is_public: false,
  };
  designer.value = undefined;
  items.value = [];
};

watch(problemListId, () => {
  if (problemListId.value) {
    loadProblemList();
  }
}, { immediate: true });

watch(createNew, () => {
  if (createNew.value) {
    clearProblemList();
    readonly.value = false;
  }
}, { immediate: true });

userStore.fetchInfo();

</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  display: flex;
}

.aside {
  width: 24em;
  height: 100%;
  padding: 1em;
  border: var(--el-border);
}

.buttons {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
}

.main {
  flex: 1;
  height: 100%;
}
</style>
