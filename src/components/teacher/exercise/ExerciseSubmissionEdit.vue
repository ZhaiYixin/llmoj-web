<template>
  <el-tabs v-model="activeTab" class="exercise-submission">
    <el-tab-pane name="test">
      <template #label>
        <el-icon>
          <CheckListIcon />
        </el-icon>
        <span>测试</span>
      </template>
      <ExerciseSubmissionTestCaseEdit v-model:testcases="_testcases" />
    </el-tab-pane>
    <el-tab-pane name="answer">
      <template #label>
        <el-icon>
          <QuestionIcon />
        </el-icon>
        <span>答案</span>
      </template>
      TODO
    </el-tab-pane>
    <el-tab-pane name="config">
      <template #label>
        <el-icon>
          <SetUp />
        </el-icon>
        <span>设置</span>
      </template>
      <ExerciseSubmissionConfigEdit v-model:design="_design" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SetUp } from '@element-plus/icons-vue';
import CheckListIcon from '../../icons/IconCheckList.vue'
import QuestionIcon from '../../icons/IconQuestion.vue'
import ExerciseSubmissionTestCaseEdit from './ExerciseSubmission/ExerciseSubmissionTestCaseEdit.vue';
import ExerciseSubmissionConfigEdit from './ExerciseSubmission/ExerciseSubmissionConfigEdit.vue';

const props = defineProps<{
  design?: any;
  testcases?: Array<any>;
}>();

const emit = defineEmits(['update:design', 'update:testcases']);

const activeTab = ref('test')
const _design = ref();
const _testcases = ref<Array<any>>();

watch(() => props.design, () => {
  if (_design.value != props.design) {
    _design.value = props.design;
  }
}, { immediate: true });

watch(() => props.testcases, () => {
  if (_testcases.value != props.testcases) {
    _testcases.value = props.testcases;
  }
}, { immediate: true });

watch(_design, () => {
  emit('update:design', _design.value);
});

watch(_testcases, () => {
  emit('update:testcases', _testcases.value);
});
</script>

<style scoped>
.exercise-submission {
  padding: 16px;
  height: 100%;
}

.exercise-submission .el-tab-pane {
  height: 100%;
}
</style>
