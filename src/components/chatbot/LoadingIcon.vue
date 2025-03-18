// LoadingIcon.vue
// 刷新图标

<template>
  <el-icon color="#409efc" class="loading-icon">
    <Loading />
  </el-icon>
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus';
import { Loading } from '@element-plus/icons-vue';
</script>

<style scoped>
.loading-icon {
  animation: spin 1s linear infinite, fade 1.5s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes fade {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
