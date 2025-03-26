<template>
  <el-table class="exercise-submission-test" :data="tableData">
    <el-table-column prop="title" label="测试用例" show-overflow-tooltip />
    <el-table-column prop="input" label="测试输入" show-overflow-tooltip />
    <el-table-column prop="output" label="预期输出" show-overflow-tooltip />
  </el-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const tableData = [
  {
    title: '1',
    input: '1 2',
    output: '3',
  },
];
</script>

<style scoped>
.exercise-submission-test {
  height: 100%;
  width: 100%;
}
</style>
