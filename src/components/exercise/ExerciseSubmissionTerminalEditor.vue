<template>
  <div ref="editorContainer" class="editor-container" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const editorContainer = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

onMounted(async () => {
  if (editorContainer.value) {
    // 动态加载 Monaco Editor
    const monaco = await import('monaco-editor');

    // 配置编辑器
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: 'plaintext',
      theme: 'vs-light',
      automaticLayout: true,
      wordWrap: 'on',
      fontSize: 14,
      renderWhitespace: 'all',
      lineNumbersMinChars: 2,
      folding: false,
      minimap: {
        enabled: false,
      },
      overviewRulerLanes: 0,
      scrollBeyondLastLine: false,
    });

    // 监听编辑器内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || '';
      emit('update:modelValue', value);
    });
  }
});

// 监听 modelValue 的变化，并同步更新编辑器内容
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue);
    }
  }
);

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.editor-container {
  width: 100%;
  height: 100%;
}
</style>
