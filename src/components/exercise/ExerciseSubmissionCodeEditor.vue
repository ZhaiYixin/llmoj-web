<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, defineProps, defineExpose } from 'vue';
import * as monaco from 'monaco-editor';
import { cTemplate, cKeywords } from './languages/c';
import { cppTemplate, cppKeywords } from './languages/cpp';
import { javaTemplate, javaKeywords } from './languages/java';
import { python2Template, python3Template, pythonKeywords } from './languages/python';
import { goTemplate, goKeywords } from './languages/go';
import { phpTemplate, phpKeywords } from './languages/php';
import { javascriptTemplate, javascriptKeywords } from './languages/javascript';

const props = defineProps({
  language: {
    type: String,
    default: 'C',
  },
});

const editorContainer = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 各语言对应的语法
const languageMap: Record<string, string> = {
  C: 'c',
  'C++': 'cpp',
  Java: 'java',
  Python2: 'python',
  Python3: 'python',
  Go: 'go',
  PHP: 'php',
  JavaScript: 'javascript',
};

// 各语言对应的默认模板
const languageTemplates: Record<string, string> = {
  C: cTemplate,
  'C++': cppTemplate,
  Java: javaTemplate,
  Python2: python2Template,
  Python3: python3Template,
  Go: goTemplate,
  PHP: phpTemplate,
  JavaScript: javascriptTemplate,
};

const editorValue = ref(languageTemplates[props.language]);

// 各语法对应的常见单词和短语
const languageKeywords: Record<string, string[]> = {
  c: cKeywords,
  cpp: cppKeywords,
  java: javaKeywords,
  python: pythonKeywords,
  go: goKeywords,
  php: phpKeywords,
  // javascript: javascriptKeywords, // Monaco编辑器已内置语言支持
};

// 注册自动补全的关键字
function registerCompletionProvider(language: string) {
  const keywords = languageKeywords[language] || [];
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
}

onMounted(() => {
  if (editorContainer.value) {
    // 配置编辑器
    editor = monaco.editor.create(editorContainer.value, {
      value: editorValue.value, // 代码内容
      language: languageMap[props.language], // 编程语言
      theme: 'vs-light', // 主题，可选 'vs', 'vs-dark', 'hc-black'
      automaticLayout: true, // 自动调整布局
      wordWrap: 'on', // 自动换行
      fontSize: 14, // 字体大小
      renderWhitespace: 'all', // 是否显示空格
      lineNumbersMinChars: 2, // 左侧栏宽度
      showFoldingControls: 'always', // 让折叠图标始终显示
      minimap: {
        enabled: false, // 右侧的代码缩略图
      },
      overviewRulerLanes: 0, // 右侧滚动条旁的标尺
      scrollBeyondLastLine: false, // 是否允许滚动超出最后一行
      padding: {
        bottom: 100, // 限制滚动超出最后一行的距离（单位：像素）
      },
    });

    // 自动补全关键字
    registerCompletionProvider(languageMap[props.language]);

    // 监听编辑器内容变化
    editor.onDidChangeModelContent(() => {
      editorValue.value = editor?.getValue() || '';
    });
  }
});

watch(() => props.language, (newLanguage, oldLanguage) => {
  if (editor && editor.getModel()) {
    // 切换默认模板
    if (editor.getValue() == languageTemplates[oldLanguage]) {
      editor.setValue(languageTemplates[newLanguage]);
    }

    // 切换语言
    monaco.editor.setModelLanguage(editor.getModel()!, languageMap[newLanguage]);
    registerCompletionProvider(languageMap[newLanguage]);
  }
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});

defineExpose({
  getEditorValue: () => editorValue.value,
  setEditorValue: (newValue: string) => {
    editorValue.value = newValue;
    editor?.setValue(newValue);
  },
});
</script>

<style scoped>
.editor-container {}
</style>
