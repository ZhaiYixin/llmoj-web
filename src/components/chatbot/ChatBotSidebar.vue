<template>
  <el-scrollbar class="aside">
    <el-menu ref="menuRef">
      <el-sub-menu v-for="(c, i) in classGroups" :key="c.id" :index="`${c.id}`">
        <template #title>
          <el-icon>
            <Reading />
          </el-icon>
          <el-text class="group-title" truncated>{{ c.title }}</el-text>
        </template>
        <el-menu-item v-for="(a, j) in c.assignments" :key="a.id" :index="`${c.id}-${a.id}`"
          @click="handleAssignmentClick(a.id)">
          <el-text truncated :class="{ 'active': selectedAssignment == a.id }">
            {{ a.title }}</el-text>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Reading } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';

const selectedAssignment = defineModel<string>('assignment-id', { default: undefined });

const menuRef = ref();
const classGroups = ref([]);

const handleAssignmentClick = (assignment_id: string) => {
  selectedAssignment.value = assignment_id;
}

const loadAssignments = async () => {
  const response = await axiosInstance.get('/assign/homeworks/');
  classGroups.value = response.data.map((x) => {
    const c = x.class_group;
    const ls = x.assignments;
    const ls_ = ls.map((x) => {
      const a = x.assignment;
      const y = {
        id: a.id,
        title: a.conversation_template?.title || a.problem_list.title,
      };
      return y;
    });
    const y = {
      id: c.id,
      title: c.title,
      assignments: ls_,
    };
    return y;
  });
};

onMounted(async () => {
  await loadAssignments();
  const c = classGroups.value.find((c) => c.assignments.length > 0);
  if (c) {
    menuRef.value.open(c.id);
    selectedAssignment.value = c.assignments[0].id;
  }
});
</script>

<style scoped>
.aside {
  width: 20em;
  border: var(--el-border);
  background-color: #F3F5F6;
}

.el-menu {
  --el-menu-bg-color: #F3F5F6;
  border-right: none;
}

.el-menu:hover {
  --el-menu-hover-bg-color: #EBEDEE;
}

.group-title {
  --el-text-font-size: var(--el-font-size-medium);
}

.active {
  color: var(--el-color-primary);
  font-weight: bold;
}
</style>
