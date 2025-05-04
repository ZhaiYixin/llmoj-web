<template>
  <el-scrollbar class="outline">
    <el-text class="title" truncated>{{ title }}</el-text>
    <div class="sections">
      <div v-for="section in sections" :key="section.id" class="section"
        :class="{ 'active': activeSection?.id == section.id }" @click="jumpToPage(section.start_page)">
        <el-tooltip
          :content="section.start_page == section.end_page ? `第${section.start_page}页` : `第${section.start_page}页-第${section.end_page}页`">
          <el-text class="section-title" truncated>{{ section.title }}</el-text>
        </el-tooltip>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { axiosInstance } from '@/services/http';

interface Section {
  id: number,
  title: string,
  description: string,
  start_page: number,
  end_page: number,
};

const props = defineProps<{
  pdfId?: string;
  current: number;
}>();

const emit = defineEmits<{
  (event: 'jump', pageNum: number): void;
}>();

const title = ref('');
const sections = ref<Array<Section>>([]);

const activeSection = computed(() => {
  // 根据当前页计算当前的 section
  const ret = sections.value.find((section) => section.start_page <= props.current && props.current <= section.end_page);
  return ret;
});

const jumpToPage = (pageNum: number) => {
  emit('jump', pageNum);
};

const loadPDFAnalysis = async (pdf_id: string) => {
  const url = `/pdf/files/${pdf_id}/analysis/`;
  const response = await axiosInstance.get(url);
  title.value = response.data.title;
  sections.value = response.data.sections;
};

watch(() => props.pdfId, () => {
  if (props.pdfId) {
    loadPDFAnalysis(props.pdfId);
  }
}, { immediate: true })

watch(() => props.current, () => {
  if (activeSection.value) {
    // 滚动到当前高亮的 section
    const activeElement = document.querySelector('.section.active');
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});
</script>

<style scoped>
.outline {
  width: 20em;
  border: var(--el-border);
  background-color: #FAFAFA;
}

.title {
  --el-text-font-size: var(--el-font-size-medium);
  font-weight: bold;
  padding: 1em;
}

.section {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.section:hover {
  background-color: #ECF5FF;
}

.section-title {
  padding: 0.2em 2em;
}

.section.active .section-title {
  color: var(--el-color-primary);
  font-weight: bold;
}
</style>
