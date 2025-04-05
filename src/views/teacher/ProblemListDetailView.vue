<template>
  <div class="screen">
    <el-scrollbar class="aside">
      <div class="floating-switch">
        <el-button v-if="readonly" @click="handleEditButtonClick" :icon="EditPen" text circle />
        <el-button-group v-else>
          <el-button @click="handleDeleteButtonClick" v-if="designedByMe" :icon="Delete" text circle />
          <el-button @click="handleUploadButtonClick" :icon="Upload" text circle />
        </el-button-group>
      </div>
      <el-form :class="{ 'read-only': readonly }" :model="form" label-position="top">
        <el-form-item :label="readonly ? '' : '标题：'">
          <el-input class="title" :readonly="readonly" v-model="form.title" size="large" />
        </el-form-item>
        <el-form-item :label="readonly ? '' : '描述：'">
          <el-input class="description" :readonly="readonly" v-model="form.description" type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }" />
        </el-form-item>
        <el-form-item :label="readonly ? '' : '包含题目：'">
          <VueDraggableNext class="problems" group="A" v-model="items" :disabled="readonly" @start="dragging = true"
            @end="dragging = false" @change="console.log" ghost-class="the-dragging-problem">
            <div class="problem" v-for="item in items" :key="item.id" @click="handleProblemClick(item)">
              <el-text class="problem-title" truncated>{{ item.title }}</el-text>
              <el-icon class="drag-handle">
                <Link v-if="readonly" />
                <Rank v-else />
              </el-icon>
            </div>
          </VueDraggableNext>
          <div v-if="readonly" />
          <VueDraggableNext v-else-if="dragging" group="A" class="operation"
            style="border-color: var(--el-color-danger);">
            <el-icon class="operation-icon" style="color: var(--el-color-danger);">
              <DeleteFilled />
            </el-icon>
          </VueDraggableNext>
          <div v-else-if="selecting" class="operation el-button" @click="handleCheckButtonClick"
            style="border-color: var(--el-color-primary);">
            <el-icon class="operation-icon" style="color: var(--el-color-primary);">
              <Check />
            </el-icon>
          </div>
          <div v-else class="operation el-button" @click="handlePlusButtonClick">
            <el-icon class="operation-icon">
              <Plus />
            </el-icon>
          </div>
        </el-form-item>
        <el-form-item v-if="!readonly" label="是否公开：">
          <el-radio-group v-model="form.is_public">
            <el-radio-button label="仅自己可用" :value="false" />
            <el-radio-button label="其他老师可见" :value="true" />
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <div class="main">
      <ExercisePage v-if="currentMain == 'problem'" v-model:problem-id="problemId"
        @problem-deleted="handleExerciseProblemDeleted" />
      <ProblemSearchPage v-else-if="currentMain == 'search'" ref="problemsSearchRef" selectable
        @plus-button-click="handleProblemsSearchPlusButtonClick" @row-click="handleProblemsSearchRowClick"
        @selection-change="handleProblemsSearchSelectionChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VueDraggableNext } from 'vue-draggable-next'
import { ElMessageBox } from 'element-plus';
import { Link, Rank, DeleteFilled, Check, Plus, EditPen, Upload, Delete } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { axiosInstance } from '@/services/http';
import ProblemSearchPage from '@/components/teacher/ProblemSearchPage.vue';
import ExercisePage from '@/components/teacher/ExercisePage.vue';

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;
const createNew = !id;

const form = reactive({
  title: '',
  description: '',
  is_public: false,
})
const readonly = ref(!createNew);
const designedByMe = ref(createNew);
const items = ref<Array<any>>([]);
const dragging = ref(false);
const selecting = ref(false);
const currentMain = ref<'problem' | 'search'>(createNew ? 'search' : 'problem');
const problemId = ref<string | null>();
const problemsSearchRef = ref();

const handleEditButtonClick = () => {
  readonly.value = false;
};

const handleDeleteButtonClick = async () => {
  let deleteMode = false;
  try {
    await ElMessageBox.confirm(
      '删除该题目集之后，将无法再找回该题目集相关的数据。',
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
    if (id) {
      const url = `/design/problem-lists/${id}/`;
      const response = await axiosInstance.delete(url);
    }
    router.replace({ name: 'ProblemListSearch' });
  }
}

const handleUploadButtonClick = async () => {
  let saveMode = null;
  if (createNew) {
    try {
      await ElMessageBox.confirm(
        '保存该题目集之后，您还可以继续修改。',
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
        '您需要修改并保存该题目集，还是需要另存为一个新的题目集？',
        '修改题目集？',
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
        '您没有权限修改其他老师的题目集，是否另存为一个新的题目集？',
        '创建题目集？',
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
    const url = `/design/problem-lists/${id}/`;
    const response = await axiosInstance.put(url, {
      problem_list: {
        title: form.title,
        description: form.description,
        is_public: form.is_public,
      },
      items: items.value.map((p) => { return { problem_id: p.id }; }),
    });
    console.log(response);
    readonly.value = true;
  } else if (saveMode == 'POST') {
    const url = `/design/problem-lists/`;
    const response = await axiosInstance.post(url, {
      problem_list: {
        title: form.title,
        description: form.description,
        is_public: form.is_public,
      },
      items: items.value.map((p) => { return { problem_id: p.id }; }),
    });
    console.log(response);
    readonly.value = true;
  }
};

const handleProblemClick = (p) => {
  currentMain.value = 'problem';
  problemId.value = p.id;
}

const handleCheckButtonClick = () => {
  const problems = problemsSearchRef.value.getSelectionRows();
  items.value = items.value.concat(problems);
  problemsSearchRef.value.clearSelection();
}

const handlePlusButtonClick = () => {
  currentMain.value = 'search';
}

const handleProblemsSearchPlusButtonClick = () => {
  problemId.value = null;
  currentMain.value = 'problem';
}

const handleProblemsSearchRowClick = (problem: any) => {
  problemId.value = problem.id;
  currentMain.value = 'problem';
}

const handleExerciseProblemDeleted = (deletedProblemId: string | null) => {
  if (deletedProblemId) {
    items.value = items.value.filter(p => p.id != deletedProblemId);
  }
  if (items.value.length) {
    currentMain.value = 'problem';
    problemId.value = items.value[0].id;
  } else {
    currentMain.value = 'search';
  }
};

const handleProblemsSearchSelectionChange = (problems: Array<any>) => {
  if (problems.length) {
    selecting.value = true;
  } else {
    selecting.value = false;
  }
}

const load = async () => {
  const url = `/design/problem-lists/${id}/`;

  const response = await axiosInstance.get(url);
  form.title = response.data.problem_list.title;
  form.description = response.data.problem_list.description;
  form.is_public = response.data.problem_list.is_public;
  items.value = response.data.items.filter((p) => p.problem).map((p) => {
    return {
      id: String(p.problem.id),
      title: p.problem.title,
      description: p.problem.description,
      updatedAt: dayjs(p.problem.updated_at).format('YYYY-MM-DD'),
    };
  });
  const designer = response.data.problem_list.designer;
  const userInfoResponse = await axiosInstance.get('/accounts/user-info/');
  const userInfo = userInfoResponse.data;
  designedByMe.value = designer != null && designer.username == userInfo.username;
  if (items.value.length) {
    currentMain.value = 'problem';
    problemId.value = items.value[0].id;
  } else {
    currentMain.value = 'search';
  }
}

if (!createNew) {
  load();
}

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

.aside {
  width: 24em;
  height: 100%;
  padding: 1em;
  border: var(--el-border);
}

.floating-switch {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
  z-index: 1000;
}

.read-only {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    cursor: default;

    .el-input__inner:read-only {
      cursor: default !important;
    }
  }

  :deep(.el-textarea__inner:read-only) {
    box-shadow: none;
    cursor: default;
  }
}

.title {
  font: bold;
  font-size: large;
}

.description :deep(.el-textarea__inner) {
  resize: none;
}

.problems {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.problem {
  border: var(--el-border);
  padding: 0.5em;
  width: 100%;
  height: 3em;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.the-dragging-problem {
  border: 2px dashed var(--el-border-color) !important;
  opacity: 0.5;
  background-color: var(--el-color-primary-light-9);
}

.problem-title {
  flex: 1;
}

.drag-handle {
  cursor: grab;
}

.read-only .drag-handle {
  cursor: pointer !important;
}

.operation {
  border: 2px dashed var(--el-border-color);
  width: 100%;
  height: 3em;
  position: relative;
}

.operation-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
