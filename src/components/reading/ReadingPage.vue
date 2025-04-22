<template>
  <div class="pdf-viewer">
    <ReadingTopToolbar :num-pages="numPages" :current="current" v-model:show-outline="showOutline" v-model:scale="scale"
      v-model:rotation="rotation" v-model:show-chat="showChat" @jump="handleToolbarJump"
      @scale-fit="handleToolbarScaleFit" />
    <div class="pdf-main">
      <ReadingLeftOutline v-if="showOutline" :pdf-id="pdfId" :current="current" @jump="handleOutlineJump" />
      <ReadingPDFRender ref="pdfRenderRef" v-model:num-pages="numPages" v-model:current="current" v-model:scale="scale"
        v-model:rotation="rotation" class="pdf-render" />
      <ReadingRightChat v-if="showChat" :pdf-id="pdfId" :current="current" />
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

const showOutline = ref(true);
const pdfRenderRef = ref();
const numPages = ref(1);
const current = ref(1);
const scale = ref(1);
const rotation = ref(0);
const showChat = ref(true);

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
