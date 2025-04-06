<template>
  <el-tabs v-model="activeTab" class="exercise-submission">
    <el-tab-pane name="test">
      <template #label>
        <el-icon>
          <CheckListIcon />
        </el-icon>
        <span>测试</span>
      </template>
      <DesignProblemRightTest v-model:testcases="testcases" />
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
    <el-tab-pane name="setup">
      <template #label>
        <el-icon>
          <SetUp />
        </el-icon>
        <span>设置</span>
      </template>
      <DesignProblemRightSetup v-model:design="design" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SetUp } from '@element-plus/icons-vue';
import CheckListIcon from '@/components/icons/IconCheckList.vue';
import QuestionIcon from '@/components/icons/IconQuestion.vue';
import DesignProblemRightTest from '@/components/teacher/design/problem/right/DesignProblemRightTest.vue';
import DesignProblemRightSetup from '@/components/teacher/design/problem/right/DesignProblemRightSetup.vue';

const props = defineProps<{
  design?: any;
  testcases?: Array<any>;
}>();

const emit = defineEmits(['update:design', 'update:testcases']);

const activeTab = ref('test');

const design = computed({
  get: () => props.design,
  set: (newVal) => {
    emit('update:design', newVal);
  },
});

const testcases = computed({
  get: () => props.testcases,
  set: (newVal) => {
    emit('update:testcases', newVal);
  },
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
