<template>
  <div class="screen">
    <el-scrollbar class="aside">
      <AssignExerciseAside v-model:assignment="assignment" v-model:pdfs="pdfs" :readonly="readonly"
        :show-button="selecting" @exercise-click="handleExerciseClick" @exercise-item-click="handleExerciseItemClick"
        @exercise-change-button-click="handleExerciseChangeButtonClick" />
      <div class="buttons">
        <el-button v-if="readonly" @click="handleEditButtonClick" :icon="EditPen" text circle />
        <el-button-group v-else>
          <el-button @click="handleDeleteButtonClick" :icon="Delete" text circle />
          <el-button @click="handleUploadButtonClick" :icon="Upload" text circle />
        </el-button-group>
      </div>
    </el-scrollbar>
    <div class="main">
      <SearchExercise ref="searchExerciseRef" :selectable="!readonly"
        @plus-button-click="handleSearchExercisePlusButtonClick" @row-click="handleSearchExerciseRowClick"
        @selection-change="handleSelectionChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox, type Action } from 'element-plus';
import { EditPen, Upload, Delete } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { axiosInstance } from '@/services/http';
import AssignExerciseAside from '@/components/teacher/assign/exercise/AssignExerciseAside.vue';
import SearchExercise from '@/components/teacher/design/SearchExercise.vue';

const props = defineProps<{
  classGroupId?: string;
  assignmentId?: string;
}>();

const emit = defineEmits<{
  (event: 'update:assignment-id', newVal?: string): void;
  (event: 'exercise-click', exerciseId: string): void;
  (event: 'problem-click', problemId: string): void;
  (event: 'exercise-create-button-click'): void;
}>();

const readonly = ref(true);
const assignment = ref({
  class_group: props.classGroupId,
  problem_list: '',
  release_date: dayjs().format(),
  due_date: dayjs().format(),
});
const pdfs = ref([]);
const selecting = ref(false);
const searchExerciseRef = ref();

const assignmentId = computed({
  get: () => props.assignmentId as string | undefined,
  set: (newVal: string | undefined) => {
    if (assignmentId.value !== newVal)
      emit('update:assignment-id', newVal);
  },
});
const createNew = computed(() => props.classGroupId && !assignmentId.value);

const handleEditButtonClick = () => {
  readonly.value = false;
};

const handleDeleteButtonClick = () => {
  ElMessageBox.confirm('删除该任务之后，将无法再找回该任务相关的数据。', '删除任务？', { confirmButtonText: '是', cancelButtonText: '否', type: 'warning', }).then(async () => {
    const url = `/assign/assignments/${assignmentId.value}/`;
    await axiosInstance.delete(url);
    ElMessage({ type: 'success', message: '删除成功' });
    assignmentId.value = undefined;
  }).catch(() => { });
}

const handleUploadButtonClick = async () => {
  if (createNew.value) {
    ElMessageBox.confirm('创建该任务之后，您还可以继续修改。', '创建任务？', { confirmButtonText: '是', cancelButtonText: '否', type: 'info' }).then(async () => {
      const response = await saveAssignment('post');
      ElMessage({ type: 'success', message: '新建成功' });
      assignmentId.value = response.data.id;
      readonly.value = true;
    }).catch(() => { });
  } else {
    ElMessageBox.confirm('如果您换掉了题目集，学生的提交将全部作废。', '修改任务？', { distinguishCancelAndClose: true, confirmButtonText: '修改', cancelButtonText: '放弃更改', type: 'warning' }).then(async () => {
      await saveAssignment('put');
      ElMessage({ type: 'success', message: '修改成功' });
      readonly.value = true;
    }).catch(async (action: Action) => {
      if (action == 'cancel') {
        await loadAssignment();
        readonly.value = true;
      }
    });
  }
};

const handleExerciseClick = () => {
  emit('exercise-click', assignment.value.problem_list);
};

const handleExerciseItemClick = (p) => {
  emit('problem-click', p.id);
};

const handleExerciseChangeButtonClick = () => {
  const selection = searchExerciseRef.value.getSelectionRows() as Array<any>;
  if (selection.length == 0) {
    ElMessage({ type: 'warning', message: '请选择一个题目集' });
  } else {
    const e = selection.pop();
    assignment.value.problem_list = e.id;
    searchExerciseRef.value.clearSelection();
  }
};

const handleSearchExercisePlusButtonClick = () => {
  emit('exercise-create-button-click');
};

const handleSearchExerciseRowClick = (e) => {
  emit('exercise-click', e.id);
};

const handleSelectionChange = (rows: any[]) => {
  if (rows.length == 0) {
    selecting.value = false;
  } else if (rows.length == 1) {
    selecting.value = true;
  } else if (rows.length > 1) {
    searchExerciseRef.value.toggleRowSelection(rows[0], false);
  }
};

const saveAssignment = async (method: 'post' | 'put') => {
  const url = (method == 'post') ? `/assign/assignments/` : `/assign/assignments/${assignmentId.value}/`;
  return await axiosInstance[method](url, {
    class_group: assignment.value.class_group,
    problem_list_id: assignment.value.problem_list,
    release_date: assignment.value.release_date,
    due_date: assignment.value.due_date,
    pdfs: pdfs.value.map(p => p.id),
  });
};

const loadAssignment = async () => {
  const url = `/assign/assignments/${assignmentId.value}/`;
  const response = await axiosInstance.get(url);
  const a = response.data.assignment;
  assignment.value.class_group = String(a.class_group);
  assignment.value.problem_list = String(a.problem_list.id);
  assignment.value.release_date = a.release_date;
  assignment.value.due_date = a.due_date;
  pdfs.value = response.data.pdfs.map(p => p.pdf);
};

const clearAssignment = () => {
  assignment.value.class_group = props.classGroupId;
  assignment.value.problem_list = '';
  assignment.value.release_date = dayjs().format();
  assignment.value.due_date = dayjs().format();
  pdfs.value = [];
};

watch(assignmentId, () => {
  if (assignmentId.value) {
    loadAssignment();
  }
}, { immediate: true });

watch(createNew, () => {
  if (createNew.value) {
    clearAssignment();
    readonly.value = false;
  }
}, { immediate: true });

</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  display: flex;
}

.main {
  flex: 1;
  height: 100%;
}

.buttons {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
}

.aside {
  width: 24em;
  height: 100%;
  padding: 1em;
  border: var(--el-border);
}
</style>
