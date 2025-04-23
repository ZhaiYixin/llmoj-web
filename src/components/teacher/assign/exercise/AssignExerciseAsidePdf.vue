<template>
  <el-upload class="upload" ref="uploadRef" v-model:file-list="fileList" :http-request="uploadFile" @remove="onRemove">
    <div class="uploader el-button">
      <el-icon class="uploader-icon">
        <Plus />
      </el-icon>
    </div>
  </el-upload>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { axiosInstance } from '@/services/http';
import { Plus } from '@element-plus/icons-vue';
import type { UploadInstance, UploadFile, UploadRequestOptions } from 'element-plus'

const props = defineProps<{
  readonly?: boolean;
}>();

const pdfs = defineModel<{ id: string; title: string }[]>('pdfs', { default: [] });

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([]);

const uploadFile = async (option: UploadRequestOptions) => {
  const formData = new FormData();
  formData.append(option.filename, option.file, option.file.name)
  try {
    const response = await axiosInstance.post('/pdf/files/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const pdf_id = response.data.pdf_id;
    await axiosInstance.post(`/pdf/files/${pdf_id}/analysis/`);
    pdfs.value.push({ id: pdf_id, title: option.file.name });
  } catch (error) {
    console.error(error);
  }
};

const onRemove = (uploadFile: UploadFile) => {
  if (uploadFile.pdf_id) {
    const index = pdfs.value.findIndex(pdf => pdf.id === uploadFile.pdf_id);
    if (index !== -1) {
      pdfs.value.splice(index, 1);
    }
  }
};

const initializeFileList = () => {
  fileList.value = pdfs.value.map(pdf => ({
    pdf_id: pdf.id,
    name: pdf.title,
    status: 'success',
    uid: 0,
  }));
};

watch(pdfs, () => {
  initializeFileList();
}, { immediate: true });
</script>

<style scoped>
.upload {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

.uploader {
  border: 2px dashed var(--el-border-color);
  width: 100%;
  height: 2em;
  position: relative;
}

.uploader-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
