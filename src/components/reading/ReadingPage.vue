<template>
  <div class="pdf-viewer">
    <ReadingTopToolbar :num-pages="numPages" :current="current" v-model:sidebar="sidebar" v-model:scale="scale"
      v-model:rotation="rotation" @jump="handleToolbarJump" @scale-fit="handleToolbarScaleFit" />
    <div class="pdf-main">
      <ReadingLeftOutline v-if="sidebar == 'outline'" :pdf-id="pdfId" :current="current" @jump="handleOutlineJump" />
      <ReadingRightChat v-else-if="sidebar == 'chat'" :pdf-id="pdfId" :current="current" />
      <ReadingPDFRender ref="pdfRenderRef" v-model:num-pages="numPages" v-model:current="current" v-model:scale="scale"
        v-model:rotation="rotation" class="pdf-render" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import { axiosInstance } from '@/services/http';
import ReadingTopToolbar from '@/components/reading/ReadingTopToolbar.vue';
import ReadingLeftOutline from '@/components/reading/ReadingLeftOutline.vue';
import ReadingPDFRender from '@/components/reading/ReadingPDFRender.vue';
import ReadingRightChat from '@/components/reading/ReadingRightChat.vue';

const props = defineProps<{
  pdfId?: string;
}>();

const sidebar = ref<'outline' | 'chat' | ''>('outline');
const pdfRenderRef = ref();
const numPages = ref(1);
const current = ref(1);
const scale = ref(1);
const rotation = ref(0);

const handleToolbarJump = (pageNum: number) => {
  pdfRenderRef.value?.jumpToPage(pageNum);
}

const handleToolbarScaleFit = (mode: 'width' | 'height') => {
  pdfRenderRef.value?.scaleFit(mode);
}

const handleOutlineJump = (pageNum: number) => {
  pdfRenderRef.value?.jumpToPage(pageNum);
};

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

<style scoped>
.pdf-viewer {
  display: flex;
  flex-direction: column;
}

.pdf-main {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow-y: hidden;
}

.pdf-render {
  flex: 1;
  background-color: #E6E8EB;
}
</style>
