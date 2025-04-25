<template>
  <el-scrollbar class="aside">
    <el-menu ref="menuRef" :default-active="defaultActive" unique-opened @open="handleOpen">
      <el-sub-menu v-for="(a, i) in assignments" :key="a.id" :index="`${a.id}`">
        <template #title>
          <el-icon>
            <ChatDotRound />
          </el-icon>
          <el-text truncated>{{ a.title }}</el-text>
        </template>
        <el-menu-item :index="`${a.id}-e${a.e.id}`" @click="handleExerciseClick(a.id)">
          <el-icon>
            <Edit />
          </el-icon>
          <el-text truncated>{{ a.e.title }}</el-text>
        </el-menu-item>
        <el-menu-item v-for="(p, i) in a.pdfs" :key="p.id" :index="`${a.id}-p${p.id}`"
          @click="handlePdfClick(p.pdf.id)">
          <el-icon>
            <Reading />
          </el-icon>
          <el-text truncated>{{ p.pdf.title }}</el-text>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Edit, Reading, ChatDotRound } from '@element-plus/icons-vue';
import { axiosInstance } from '@/services/http';

const emit = defineEmits<{
  (event: 'exercise-click', assignment_id: string): void;
  (event: 'pdf-click', pdf_id: string): void;
}>();

const selectedAssignment = defineModel<string>('assignment-id', { default: undefined });

const menuRef = ref();
const defaultActive = ref();
const assignments = ref([]);

const handleOpen = (indexPath: string[]) => {
  selectedAssignment.value = indexPath[0];
};

const handleExerciseClick = (assignment_id: string) => {
  emit('exercise-click', assignment_id);
};

const handlePdfClick = (pdf_id: string) => {
  emit('pdf-click', pdf_id);
}

const loadAssignments = async () => {
  const response = await axiosInstance.get('/assign/homeworks/');
  assignments.value = response.data.map((x) => {
    const a = x.assignment;
    const y = {
      id: a.id,
      title: a.conversation_template?.title || a.problem_list.title,
      e: a.problem_list,
      pdfs: x.pdfs,
    };
    return y;
  });
};

onMounted(async () => {
  await loadAssignments();
  if (assignments.value.length > 0) {
    menuRef.value.open(assignments.value[0].id);
  }
});
</script>

<style scoped>
.aside {
  width: 20em;
  border-right: var(--el-border);
}
</style>
