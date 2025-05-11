<template>
  <el-scrollbar class="exercise-problem">
    <div class="header">
      <el-text truncated class="title" size="large">{{ title }}</el-text>
      <div v-if="problemList.length">
        <el-button text :icon="ArrowLeft" @click="problemIndex--">上一题</el-button>
        <el-dropdown :tabindex="-1">
          <el-button text>{{ problemIndex + 1 }} / {{ problemList.length }}</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="(p, index) in problemList" :key="p.i" @click="problemIndex = index"
                :icon="getMenuIcon(p.i)">
                {{ p.title }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button text @click="problemIndex++">
          下一题
          <el-icon class="el-icon--right">
            <ArrowRight />
          </el-icon>
        </el-button>
      </div>
    </div>
    <TextEditor class="description" v-model="description" :readonly="true" />
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { axiosInstance } from '@/services/http';
import { ArrowLeft, ArrowRight, Select, CloseBold, EditPen } from '@element-plus/icons-vue'
import TextEditor from '../teacher/design/TextEditor.vue';

const props = defineProps<{
  problemId?: string;
  itemId?: string;
  problemListId?: string;
  assignmentId?: string;
}>();

const emit = defineEmits(['update-item']);

const title = ref('');
const description = ref('');
const problemList = ref([]);
const homework = ref({});

const problemIndex = computed({
  get: () => {
    return problemList.value.findIndex(p => p.id == props.problemId);
  },
  set: (newIndex) => {
    if (newIndex >= 0 && newIndex < problemList.value.length) {
      emit('update-item', problemList.value[newIndex].i, problemList.value[newIndex].id);
    }
  }
});

const getMenuIcon = (itemId: string) => {
  const p = homework.value[itemId];
  if (!p || !p.best_submission) return EditPen;
  const b = p.best_submission;
  return (b.success_count == b.total_count) ? Select : CloseBold;
}

const loadProblem = async (id: string) => {
  const p = problemList.value.find(p => p.id == id);
  if (p) {
    title.value = p.title;
    description.value = p.description;
  } else {
    const response = await axiosInstance.get(`/judge/problems/?problem_id=${id}`);
    title.value = response.data[0].title;
    description.value = response.data[0].description;
  }
}

const loadProblemList = async (id: string) => {
  const url = `/design/problem-lists/${id}/`;
  const response = await axiosInstance.get(url);
  problemList.value = response.data.items.filter((p) => p.problem).map((p) => ({
    i: String(p.id),
    id: String(p.problem.id),
    title: p.problem.title,
    description: p.problem.description,
  }));
  if (problemList.value.length > 0 && problemIndex.value == -1) {
    problemIndex.value = 0;
  }
}

const loadAssignment = async (id: string) => {
  const url = `/assign/homeworks/${id}/`;
  const response = await axiosInstance.get(url);
  const a = response.data.assignment;
  const h = response.data.homework;
  homework.value = h?.problems || {};
  loadProblemList(a.problem_list.id);
};

watch(() => props.problemId, () => {
  if (props.problemId)
    loadProblem(props.problemId);
}, { immediate: true });

watch(() => props.problemListId, () => {
  if (props.problemListId)
    loadProblemList(props.problemListId);
}, { immediate: true });

watch(() => props.assignmentId, () => {
  if (props.assignmentId)
    loadAssignment(props.assignmentId);
}, { immediate: true });
</script>

<style scoped>
.exercise-problem {
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.header {
  height: 2.5em;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  flex: 1;
  font-size: var(--el-font-size-extra-large);
}

.description {
  flex: 1;
  display: flex;
  flex-direction: column;
  font-size: var(--el-font-size-medium);
}
</style>
