<template>
  <div>
    <div class="header">
      <el-text class="header-cell" truncated>测试点</el-text>
      <el-text class="header-cell" truncated>输入</el-text>
      <el-text class="header-cell" truncated>预期输出</el-text>
    </div>
    <DraggableList v-model="testCases" :item-key="item => item.id" :readonly="false" @item-click="handleTestCaseClick"
      @plus-button-click="handlePlusButtonClick">
      <template #item="{ item }">
        <el-text class="testcase-cell" truncated>{{ item.title }}</el-text>
        <el-text class="testcase-cell" truncated>{{ item.input }}</el-text>
        <el-text class="testcase-cell" truncated>{{ item.output }}</el-text>
      </template>
    </DraggableList>
    <el-dialog v-model="showDialog">
      <div class="dialog">
        <el-input v-model="dialog.title" class="dialog-title" />
        <ExerciseSubmissionTerminalTextarea v-model="dialog.input" />
        <ExerciseSubmissionTerminalTextarea v-model="dialog.output" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DraggableList from '@/components/teacher/design/DraggableList.vue';
import ExerciseSubmissionTerminalTextarea from '@/components/exercise/ExerciseSubmission/ExerciseSubmissionTerminalTextarea.vue';

const props = defineProps<{
  testcases?: Array<any>;
}>();

const emit = defineEmits(['update:testcases']);

const showDialog = ref(false);
const selectedTestCase = ref<any>();

const testCases = computed({
  get: () => props.testcases || [],
  set: (newVal) => {
    emit('update:testcases', newVal);
  },
});

const dialog = computed({
  get: () => {
    return selectedTestCase.value || { title: '', input: '', output: '' };
  },
  set: (newVal) => {
    if (selectedTestCase.value) {
      selectedTestCase.value = newVal;
    }
  },
});

const handleTestCaseClick = (testCase: any) => {
  selectedTestCase.value = testCase;
  showDialog.value = true;
};

const handlePlusButtonClick = () => {
  const newTestCase = {
    title: `标题`,
    input: '输入',
    output: '预期输出',
  };
  testCases.value.push(newTestCase);
  handleTestCaseClick(newTestCase);
};
</script>

<style scoped>
.header {
  padding: 0.5em;
  width: 100%;
  display: flex;
}

.header-cell {
  flex: 1;
  color: var(--el-text-color-secondary);
}

.testcase-cell {
  flex: 1;
}

.dialog {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.dialog-title {
  font: bold;
  font-size: large;
}
</style>
