<template>
  <el-form :class="{ 'read-only': readonly }" :model="problemList" label-position="top">
    <el-form-item :label="readonly ? '' : '标题：'">
      <el-input class="title" :readonly="readonly" v-model="problemList.title" size="large" />
    </el-form-item>
    <el-form-item :label="readonly ? '' : '描述：'">
      <el-input class="description" :readonly="readonly" v-model="problemList.description" type="textarea"
        :autosize="{ minRows: 2, maxRows: 4 }" />
    </el-form-item>
    <el-form-item :label="readonly ? '' : '包含题目：'">
      <DraggableList v-model="items" :item-key="item => item.id" :readonly="readonly" @item-click="handleItemClick"
        @plus-button-click="handlePlusButtonClick">
        <template #item="{ item }">
          <el-text class="problem-title" truncated>{{ item.title }}</el-text>
        </template>
      </DraggableList>
    </el-form-item>
    <el-form-item v-if="!readonly" label="是否公开：">
      <el-radio-group v-model="problemList.is_public">
        <el-radio-button label="仅自己可用" :value="false" />
        <el-radio-button label="其他老师可见" :value="true" />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import DraggableList from '@/components/teacher/design/DraggableList.vue';

const props = defineProps({
  problemList: {
    type: Object,
    required: true,
  },
  items: {
    type: Array as PropType<Array<any>>,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: 'update:problemList', value: any): void;
  (event: 'update:items', value: any[]): void;
  (event: 'item-click', item: any): void;
  (event: 'plus-button-click'): void;
}>();

const problemList = computed({
  get: () => props.problemList,
  set: (newValue: any) => {
    emit('update:problemList', newValue);
  },
});

const items = computed({
  get: () => props.items,
  set: (newValue: any[]) => {
    emit('update:items', newValue);
  },
});

const handleItemClick = (item: any) => {
  emit('item-click', item);
}

const handlePlusButtonClick = () => {
  emit('plus-button-click');
};

</script>

<style scoped>
.read-only {
  :deep(.el-input__wrapper) {
    box-shadow: none;
    cursor: default;

    .el-input__inner:read-only {
      cursor: default !important;
    }
  }

  :deep(.el-textarea__inner:read-only) {
    box-shadow: none;
    cursor: default;
  }
}

.title {
  font: bold;
  font-size: large;
}

.description :deep(.el-textarea__inner) {
  resize: none;
}
</style>
