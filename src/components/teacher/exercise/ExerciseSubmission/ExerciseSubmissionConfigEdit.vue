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
import { reactive, watch } from 'vue';

const props = defineProps<{
  design?: any;
}>();

const emit = defineEmits(['update:design']);

const form = reactive({
  is_public: false,
});

watch(() => props.design, () => {
  if (props.design) {
    form.is_public = props.design.is_public;
  }
}, { immediate: true });

watch(form, () => {
  emit("update:design", form);
})
</script>

<style scoped></style>
