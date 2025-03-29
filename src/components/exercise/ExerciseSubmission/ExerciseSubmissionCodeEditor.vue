<template>
  <CodeEditor :language="props.language" v-model="editorValue" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CodeEditor from './CodeEditor.vue';
import { cTemplate } from './languages/c';
import { cppTemplate } from './languages/cpp';
import { javaTemplate } from './languages/java';
import { python2Template, python3Template } from './languages/python';
import { goTemplate } from './languages/go';
import { phpTemplate } from './languages/php';
import { javascriptTemplate } from './languages/javascript';

const props = defineProps<{
  language?: string;
}>();

const editorValue = ref('');

const languageTemplates: Record<string, string> = {
  C: cTemplate,
  'C++': cppTemplate,
  Java: javaTemplate,
  Python2: python2Template,
  Python3: python3Template,
  Go: goTemplate,
  PHP: phpTemplate,
  JavaScript: javascriptTemplate,
} as const;

defineExpose({
  getEditorValue: () => editorValue.value,
  setEditorValue: (newValue: string) => editorValue.value = newValue,
  startWithTemplate: () => {
    if (props.language) {
      editorValue.value = languageTemplates[props.language];
    } else {
      editorValue.value = '请在此输入代码';
    }
  },
})

export type ExerciseSubmissionCodeEditorInstance = {
  getEditorValue: () => string;
  setEditorValue: (newValue: string) => void;
  startWithTemplate: () => void;
};
</script>

<style scoped></style>
