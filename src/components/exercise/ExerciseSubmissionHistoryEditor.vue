<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { cKeywords } from './languages/c';
import { cppKeywords } from './languages/cpp';
import { javaKeywords } from './languages/java';
import { pythonKeywords } from './languages/python';
import { goKeywords } from './languages/go';
import { phpKeywords } from './languages/php';
import { javascriptKeywords } from './languages/javascript';

const props = defineProps({
  language: {
    type: String,
    default: 'C',
  },
  editorValue: {
    type: String,
    default: '',
  }
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
const registerCompletionProvider = async (language: string) => {
  const monaco = await import('monaco-editor'); // 动态导入
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

onMounted(async () => {
  if (editorContainer.value) {
    // 动态加载 monaco-editor
    const monaco = await import('monaco-editor');

    // 配置编辑器
    editor = monaco.editor.create(editorContainer.value, {
      value: props.editorValue, // 代码内容
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
      readOnly: true,
    });

    // 自动补全关键字
    await registerCompletionProvider(languageMap[props.language]);
  }
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.editor-container {}
</style>
