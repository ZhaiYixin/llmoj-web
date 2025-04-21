<template>
  <el-row class="toolbar">
    <el-col :span="4">
      <el-button :icon="MenuListIcon" text :bg="showOutline" @click="handleShowOutlineButtonClick" />
    </el-col>
    <el-col :span="16" class="toolbar-middle">
      <el-input-number v-model="scaleInPercent" @change="onScaleInPercentChange" :min="0" :step="20">
        <template #decrease-icon>
          <el-icon>
            <Minus />
          </el-icon>
        </template>
        <template #suffix>
          <span>%</span>
        </template>
        <template #increase-icon>
          <el-icon>
            <Plus />
          </el-icon>
        </template>
      </el-input-number>
      <el-button @click="handleScaleFit">
        <el-icon>
          <FitWidthIcon v-if="scaleFitMode == 'width'" />
          <FitHeightIcon v-else />
        </el-icon>
      </el-button>
      <el-input-number v-model="currentPage" @change="onPageChange" :min="1" :max="numPages" step-strictly>
        <template #decrease-icon>
          <el-icon>
            <ArrowLeft />
          </el-icon>
        </template>
        <template #suffix>
          <span>/ {{ props.numPages }}</span>
        </template>
        <template #increase-icon>
          <el-icon>
            <ArrowRight />
          </el-icon>
        </template>
      </el-input-number>
      <el-button @click="handleRotateRight">
        <el-icon>
          <RotateRightIcon />
        </el-icon>
      </el-button>
    </el-col>
    <el-col :span="4">
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ArrowRight, Minus, Plus } from '@element-plus/icons-vue';
import MenuListIcon from '@/components/icons/IconMenuList.vue'
import FitWidthIcon from '@/components/icons/IconFitWidth.vue'
import FitHeightIcon from '@/components/icons/IconFitHeight.vue'
import RotateRightIcon from '@/components/icons/IconRotateRight.vue'

const props = defineProps<{
  numPages: number;
  current: number;
}>();

const emit = defineEmits<{
  (event: 'jump', pageNum: number): void;
  (event: 'scale-fit', mode: 'width' | 'height'): void;
}>();

const showOutline = defineModel<boolean>('show-outline', { default: true });
const scale = defineModel<number>('scale', { default: 1 });
const rotation = defineModel<number>('rotation', { default: 0 });

const currentPage = ref(props.current);
const scaleInPercent = ref(100);
const scaleFitMode = ref<'width' | 'height'>('width');

const handleShowOutlineButtonClick = () => {
  showOutline.value = !showOutline.value;
}

const onPageChange = (page: number) => {
  if (page < 1 || page > (props.numPages || 1)) {
    ElMessage.error('页码超出范围');
    return;
  }
  emit('jump', page);
};

const onScaleInPercentChange = (scaleInPercentValue: number) => {
  scale.value = scaleInPercentValue / 100;
};

const handleScaleFit = () => {
  if (scaleFitMode.value == 'width') {
    emit('scale-fit', 'width');
    scaleFitMode.value = 'height';
  } else {
    emit('scale-fit', 'height');
    scaleFitMode.value = 'width';
  }
}

const handleRotateRight = () => {
  rotation.value = (rotation.value + 90) % 360;
};

watch(() => props.current, () => {
  currentPage.value = props.current;
});

watch(scale, (value) => {
  scaleInPercent.value = Math.floor(100 * value);
});
</script>

<style scoped>
.toolbar {
  padding: 10px;
  background-color: #FAFAFA;
  border-bottom: var(--el-border);
}

.toolbar-middle {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
</style>
