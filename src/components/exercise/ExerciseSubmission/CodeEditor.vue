<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { cKeywords } from './languages/c';
import { cppKeywords } from './languages/cpp';
import { javaKeywords } from './languages/java';
import { pythonKeywords } from './languages/python';
import { goKeywords } from './languages/go';
import { phpKeywords } from './languages/php';
// import { javascriptKeywords } from './languages/javascript';

const props = withDefaults(defineProps<{
  modelValue?: string;
  language?: string;
  readonly?: boolean;
}>(), {
  modelValue: '',
  language: 'plaintext',
  readonly: false,
});

const emit = defineEmits(['update:modelValue']);

const languageMap: Record<string, string> = {
  C: 'c',
  'C++': 'cpp',
  Java: 'java',
  Python2: 'python',
  Python3: 'python',
  Go: 'go',
  PHP: 'php',
  JavaScript: 'javascript',
  plaintext: 'plaintext',
} as const;

const languageKeywords: Record<string, string[]> = {
  C: cKeywords,
  'C++': cppKeywords,
  Java: javaKeywords,
  Python2: pythonKeywords,
  Python3: pythonKeywords,
  Go: goKeywords,
  PHP: phpKeywords,
} as const;

const editorContainer = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 注册自动补全的关键字
const registerCompletionProvider = async (language: string, keywords: string[]) => {
  const monaco = await import('monaco-editor');
  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: () => {
      const suggestions = keywords.map((keyword) => ({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
      }));
      return { suggestions };
    },
  });
};

onMounted(async () => {
  if (editorContainer.value) {
    const monaco = await import('monaco-editor');

    // 创建编辑器
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: languageMap[props.language] || 'plaintext',
      theme: 'vs-light',
      automaticLayout: true,
      wordWrap: 'on',
      fontSize: 14,
      renderWhitespace: 'all',
      lineNumbersMinChars: 2,
      showFoldingControls: 'always',
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      scrollBeyondLastLine: false,
      padding: { bottom: 100 },
      readOnly: props.readonly,
    });

    editor.onDidChangeModelContent(() => {
      // 同步内容变化（子组件 --> 父组件）
      emit('update:modelValue', editor?.getValue() || '');
    });

    // 注册自动补全
    if (languageMap[props.language] && languageKeywords[props.language])
      await registerCompletionProvider(languageMap[props.language], languageKeywords[props.language]);
  }
});

watch(() => props.language, async (newLanguage) => {
  if (editor && editor.getModel()) {
    // 修改编辑器语言
    const monaco = await import('monaco-editor');
    monaco.editor.setModelLanguage(editor.getModel()!, languageMap[newLanguage] || 'plaintext');
    // 注册自动补全
    if (languageMap[props.language] && languageKeywords[props.language])
      await registerCompletionProvider(languageMap[props.language], languageKeywords[props.language]);
  }
});

watch(() => props.modelValue, (newValue) => {
  // 同步内容变化（父组件 --> 子组件）
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue);
  }
});

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
