<template>
  <div>
    <div class="header">
      <el-text class="header-cell" truncated>测试点</el-text>
      <el-text class="header-cell" truncated>输入</el-text>
      <el-text class="header-cell" truncated>预期输出</el-text>
      <el-icon />
    </div>
    <VueDraggableNext class="testcases" group="A" v-model="testCases" @start="dragging = true" @end="dragging = false"
      @change="console.log" ghost-class="the-dragging-testcase">
      <div class="testcase" v-for="(item, idx) in testCases" :key="item.id" @click="handleTestCaseClick(item, idx)">
        <el-text class="testcase-cell" truncated>{{ item.title }}</el-text>
        <el-text class="testcase-cell" truncated>{{ item.input }}</el-text>
        <el-text class="testcase-cell" truncated>{{ item.output }}</el-text>
        <el-icon class="drag-handle">
          <Rank />
        </el-icon>
      </div>
    </VueDraggableNext>
    <VueDraggableNext v-if="dragging" group="A" class="operation" style="border-color: var(--el-color-danger);">
      <el-icon class="operation-icon" style="color: var(--el-color-danger);">
        <DeleteFilled />
      </el-icon>
    </VueDraggableNext>
    <div v-else class="operation el-button" @click="handlePlusButtonClick">
      <el-icon class="operation-icon">
        <Plus />
      </el-icon>
    </div>
    <el-dialog v-model="dialog.show" :before-close="handleDialogClose">
      <div class="dialog">
        <el-input v-model="dialog.title" class="dialog-title" />
        <ExerciseSubmissionTerminalTextarea v-model="dialog.input" />
        <ExerciseSubmissionTerminalTextarea v-model="dialog.output" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { Rank, DeleteFilled, Plus } from '@element-plus/icons-vue';
import { VueDraggableNext } from 'vue-draggable-next';
import ExerciseSubmissionTerminalTextarea from '../../../exercise/ExerciseSubmission/ExerciseSubmissionTerminalTextarea.vue';

const props = defineProps<{
  testcases?: Array<any>;
}>();

const emit = defineEmits(['update:testcases']);

const testCases = ref<Array<any>>([]);
const dragging = ref(false);
const dialog = reactive({
  show: false,
  title: '',
  input: '',
  output: '',
})

let selectedTestCase = -1;

const handleTestCaseClick = (testCase: any, idx: number) => {
  selectedTestCase = idx;
  dialog.title = testCase.title;
  dialog.input = testCase.input;
  dialog.output = testCase.output;
  dialog.show = true;
}

const handlePlusButtonClick = () => {
  selectedTestCase = testCases.value.length;
  testCases.value.push({
    title: `标题`,
    input: '输入',
    output: '预期输出',
  });
  handleTestCaseClick(testCases.value[selectedTestCase], selectedTestCase);
}

const handleDialogClose = (done: () => void) => {
  testCases.value[selectedTestCase].title = dialog.title;
  testCases.value[selectedTestCase].input = dialog.input;
  testCases.value[selectedTestCase].output = dialog.output;
  done()
}

watch(() => props.testcases, async () => {
  if (testCases.value != props.testcases) {
    testCases.value = props.testcases;
  }
}, { immediate: true });

watch(() => testCases.value, () => {
  emit('update:testcases', testCases.value);
});

</script>

<style scoped>
.header {
  padding: 0.5em;
  width: 100%;
  height: 3em;
  display: flex;
  align-items: center;
}

.header-cell {
  flex: 1;
  color: var(--el-text-color-secondary);
}

.testcases {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.testcase {
  border: var(--el-border);
  padding: 0.5em;
  width: 100%;
  height: 3em;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.testcase-cell {
  flex: 1;
}

.the-dragging-testcase {
  border: 2px dashed var(--el-border-color) !important;
  opacity: 0.5;
  background-color: var(--el-color-primary-light-9);
}

.drag-handle {
  cursor: grab;
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
