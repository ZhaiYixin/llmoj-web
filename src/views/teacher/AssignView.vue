<template>
  <div class="screen">
    <el-scrollbar class="aside">
      TODO
    </el-scrollbar>
    <div class="main">
      <SearchExercise />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchExercise from '@/components/teacher/design/SearchExercise.vue';
</script>

<style scoped>
.screen {
  width: 100%;
  height: 100%;
  display: flex;
}

.main {
  flex: 1;
  height: 100%;
}

.aside {
  width: 24em;
  height: 100%;
  padding: 1em;
  border: var(--el-border);
}
</style>
