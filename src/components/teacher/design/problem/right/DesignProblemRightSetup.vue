<template>
  <el-form label-position="top">
    <el-form-item label="是否公开：">
      <el-radio-group v-model="form.is_public">
        <el-radio-button label="仅自己可用" :value="false" />
        <el-radio-button label="其他老师可见" :value="true" />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  design?: any;
}>();

const emit = defineEmits(['update:design']);

const form = computed({
  get: () => props.design,
  set: (newVal) => {
    emit('update:design', newVal);
  },
});
</script>

<style scoped></style>
