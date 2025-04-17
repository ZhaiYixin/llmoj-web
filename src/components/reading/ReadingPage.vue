<template>
  <ReadingPDFRender ref="pdfRenderRef" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { axiosInstance } from '@/services/http';
import ReadingPDFRender from '@/components/reading/ReadingPDFRender.vue';

const props = defineProps<{
  pdfId?: string;
}>();

const pdfRenderRef = ref();

const loadPDFFile = async (pdf_id: string) => {
  const url = `/pdf/files/${pdf_id}/`;
  const response = await axiosInstance.get(url);
  const file_url = axiosInstance.getUri({ url: response.data.file_url });
  pdfRenderRef.value?.load(file_url);
};

watch(() => props.pdfId, () => {
  if (props.pdfId) {
    loadPDFFile(props.pdfId);
  }
}, { immediate: true })

</script>

<style scoped></style>
