<template>
  <el-form label-position="top">
    <el-form-item label="题目集：">
      <el-form v-if="problemList" class="read-only" style="width: 100%;">
        <el-form-item>
          <el-input class="title" :readonly="true" v-model="problemList.title" size="large"
            @click="handleExerciseClick" />
          <div class="buttons">
            <el-button v-if="showButton" :icon="Switch" type="primary"
              @click="handleExerciseChangeButtonClick">更换</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-input class="description" :readonly="true" v-model="problemList.description" type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }" />
        </el-form-item>
        <el-form-item>
          <DraggableList v-model="problemList.items" :item-key="item => item.id" :readonly="true"
            @item-click="handleExerciseItemClick">
            <template #item="{ item }">
              <el-text class="problem-title" truncated>{{ item.title }}</el-text>
            </template>
          </DraggableList>
        </el-form-item>
      </el-form>
      <el-empty v-else description="未添加题目集" style="width: 100%;">
        <el-button v-if="showButton" :icon="Plus" type="primary" @click="handleExerciseChangeButtonClick">添加</el-button>
      </el-empty>
    </el-form-item>
    <el-form-item label="起止时间：">
      <el-date-picker v-model="dateRange" :readonly="readonly" type="daterange" range-separator="~"
        start-placeholder="开始日期" end-placeholder="截止日期" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Switch, Plus } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { axiosInstance } from '@/services/http';
import DraggableList from '@/components/teacher/design/DraggableList.vue';

const props = defineProps({
  assignment: {
    type: Object,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  showButton: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: 'update:assignment', value: any): void;
  (event: 'exercise-click'): void;
  (event: 'exercise-item-click', value: any): void;
  (event: 'exercise-change-button-click'): void;
}>();

const problemList = ref();

const assignment = computed({
  get: () => props.assignment,
  set: (newValue: any) => {
    emit('update:assignment', newValue);
  },
});

const problemListId = computed({
  get: () => props.assignment.problem_list,
  set: (newValue: any) => {
    emit('update:assignment', {
      ...assignment.value,
      problem_list: newValue,
    });
  },
});

const dateRange = computed({
  get: () => {
    return [props.assignment.release_date, props.assignment.due_date];
  },
  set: (newValue: any) => {
    if (newValue) {
      emit('update:assignment', {
        ...props.assignment,
        release_date: dayjs(newValue[0]).format(),
        due_date: dayjs(newValue[1]).format(),
      });
    } else {
      emit('update:assignment', {
        ...props.assignment,
        release_date: dayjs().format(),
        due_date: dayjs().format(),
      });
    }
  },
});

const handleExerciseClick = () => {
  emit('exercise-click');
}

const handleExerciseItemClick = (item: any) => {
  emit('exercise-item-click', item);
}

const handleExerciseChangeButtonClick = () => {
  emit('exercise-change-button-click');
}

const loadProblemList = async (id: string) => {
  const url = `/design/problem-lists/${id}/`;
  const response = await axiosInstance.get(url);
  const problem_list = response.data.problem_list;
  const items = response.data.items.filter((p) => p.problem).map((p) => ({
    id: String(p.problem.id),
    title: p.problem.title,
    description: p.problem.description,
  }));
  problemList.value = {
    title: problem_list.title,
    description: problem_list.description,
    items: items,
  };
}

watch(problemListId, () => {
  if (problemListId.value)
    loadProblemList(problemListId.value);
}, { immediate: true });

</script>

<style scoped>
.read-only {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    cursor: default;

    .el-input__inner:read-only {
      cursor: pointer !important;
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

.buttons {
  position: absolute;
  top: 0.3em;
  right: 0.3em;
}
</style>
