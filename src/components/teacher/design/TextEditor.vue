<template>
  <div>
    <Toolbar v-show="!readonly" :editor="editorRef" :defaultConfig="toolbarConfig" />
    <Editor :class="{ 'writable': !readonly }" v-model="valueHtml" :defaultConfig="editorConfig"
      @onCreated="handleCreated" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IToolbarConfig, IEditorConfig, IDomEditor } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'

const props = defineProps<{
  modelValue: string;
  readonly: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>();

// 内容 HTML
const valueHtml = ref('<p>hello</p>');

const toolbarConfig: Partial<IToolbarConfig> = {};
toolbarConfig.toolbarKeys = [
  'blockquote',
  'codeBlock',
  // 'uploadImage', // TODO
  {
    key: 'group-justify',
    title: '对齐',
    iconSvg: '<svg viewBox=\"0 0 1024 1024\"><path d=\"M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z\"></path></svg>',
    menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'],
  },
];

const editorConfig: Partial<IEditorConfig> = {};
editorConfig.readOnly = props.readonly;
editorConfig.scroll = false;

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};

watch(() => props.modelValue, (newVal) => {
  if (valueHtml.value !== props.modelValue) {
    valueHtml.value = newVal;
  }
}, { immediate: true });

watch(valueHtml, (newVal) => {
  emit('update:modelValue', newVal);
});

watch(() => props.readonly, (newVal) => {
  if (newVal) {
    editorRef.value?.disable();
  } else {
    editorRef.value?.enable();
  }
});

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
});
</script>

<style scoped>
.writable :deep(div[id^="w-e-textarea"]) {
  border-radius: var(--el-border-radius-base);
  box-shadow: 0 0 0 1px var(--el-border-color);
}

.writable :deep(div[id^="w-e-textarea"]:focus) {
  border: 1px solid var(--el-color-primary);
}
</style>
