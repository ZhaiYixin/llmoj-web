## 有哪些页面？

- 学生端
  1. 聊天机器人（`ChatBotView.vue`）
  2. OJ做题（`ExerciseView.vue`）
  3. PDF阅读器（`ReadingView.vue`）
- 教师端
  1. 出题（`DesignProblemView.vue`）
  2. 组题（`DesignExerciseView.vue`）
  3. 布置作业（`AssignExerciseView.vue`）
  4. 教学班级（`AssignClassesView.vue`）
  5. 完成情况（`AssignStudentsView.vue`）

## 这些页面之间的关系？

页面的跳转关系如下：

![页面跳转图](docs\img\page_navigation.png)

## 有用到什么第三方库吗？

- 渲染Markdown文本（`"marked": "^15.0.7"`）
- 代码语法高亮（`"highlight.js": "^11.11.1"`）
- 代码编辑器（`"monaco-editor": "^0.52.2"`）
- 富文本编辑器（`"@wangeditor/editor": "^5.1.23"`）
- 渲染PDF文档（`"pdfjs-dist": "^5.1.91"`）
