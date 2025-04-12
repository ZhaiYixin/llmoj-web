<template>
  <el-table :data="tableData" show-summary :summary-method="getSummaries">
    <el-table-column type="index" />
    <el-table-column prop="student" label="学生" />
    <el-table-column v-for="(p, i) in problemListItems" :key="p.id" :prop="`p${p.id}`" :label="p.problem.title" />
    <el-table-column prop="created_at" label="开始时间" />
  </el-table>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import dayjs from 'dayjs';
import { axiosInstance } from '@/services/http';

const props = defineProps<{
  assignmentId?: string;
}>();

const assignment = ref();
const homeworks = ref([]);
const problemListItems = ref([]);
const classMembers = ref([]);

const tableData = computed(() => {
  return classMembers.value.map((m) => {
    const row: { student: string;[key: string]: any } = {
      student: m.student.full_name,
    };
    const homework = homeworks.value.find((hw) => hw.class_member === m.id);
    row['created_at'] = homework?.created_at ? dayjs(homework?.created_at).format('YYYY-MM-DD HH:mm') : '未开始';

    const problems = homework?.problems || {};
    problemListItems.value.forEach((p, i) => {
      const problem = problems[p.id];
      if (problem) {
        const best = problem.best_submission;
        row[`p${p.id}`] = `${best.success_count} / ${best.total_count}`;
      } else {
        row[`p${p.id}`] = '-';
      }
    });

    return row;
  });
});

const getSummaries = (param) => {
  const { columns, data } = param
  const sums: string[] = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合计';
    } else if (index === 1) {
      sums[index] = `${classMembers.value.length}`;
    } else if (index === columns.length - 1) {
      const values = data.map((item) => item[column.property] != '未开始');
      const sum = values.reduce((prev, curr) => prev + curr, 0);
      sums[index] = `${sum}`
    } else {
      const values = data.map((item) => Number(item[column.property].split('/')[0]));
      const sum = values.reduce((prev, curr) => {
        const value = Number(curr);
        if (!Number.isNaN(value)) {
          return prev + curr
        } else {
          return prev
        }
      }, 0);
      const mean = sum / classMembers.value.length;
      sums[index] = `${mean}`;
    }
  })


  return sums
};

const loadAssignment = async (assignment_id: string) => {
  const url = `/assign/assignments/${assignment_id}/`;
  const response = await axiosInstance.get(url);
  const a = response.data.assignment;
  assignment.value = {
    class_group: String(a.class_group),
    problem_list: String(a.problem_list),
  };
  homeworks.value = response.data.homeworks;
};

const loadClassMembers = async (classGroupId: string) => {
  const url = `/assign/classes/${classGroupId}/`;
  const response = await axiosInstance.get(url);
  classMembers.value = response.data.students;
}

const loadProblemList = async (problmeListId: string) => {
  const url = `/design/problem-lists/${problmeListId}/`;
  const response = await axiosInstance.get(url);
  problemListItems.value = response.data.items;
}

watch(() => props.assignmentId, async () => {
  if (props.assignmentId) {
    await loadAssignment(props.assignmentId);
    loadClassMembers(assignment.value.class_group);
    loadProblemList(assignment.value.problem_list);
  }
}, { immediate: true });
</script>

<style scoped></style>
