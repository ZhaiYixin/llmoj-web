<script setup lang="ts">
import { RouterView } from 'vue-router';
import LoginModal from '@/components/LoginModal.vue';
</script>

<template>
  <RouterView style="width: 100vw; height: 100vh;" />
  <LoginModal />
</template>

<style scoped></style>
