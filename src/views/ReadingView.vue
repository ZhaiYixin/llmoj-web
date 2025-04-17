<template>
  <ReadingPage :pdf-id="pdfId" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import ReadingPage from '@/components/reading/ReadingPage.vue';

const route = useRoute();

const pdfId = computed(() => route.query.pdf as string | undefined)
</script>

<style></style>
