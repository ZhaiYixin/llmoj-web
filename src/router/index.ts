import { createRouter, createWebHistory } from 'vue-router'
import ChatBotView from '../views/ChatBotView.vue'
import AssignClassesView from '@/views/teacher/assign/AssignClassesView.vue'
import AssignStudentsView from '@/views/teacher/assign/AssignStudentsView.vue'
import AssignExerciseView from '../views/teacher/assign/AssignExerciseView.vue'
import DesignExerciseView from '../views/teacher/design/DesignExerciseView.vue'
import DesignProblemView from '../views/teacher/design/DesignProblemView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/chatbot',
      name: 'chatbot',
      component: ChatBotView,
    },
    {
      path: '/exercise/:id',
      name: 'exercise',
      component: () => import('../views/ExerciseView.vue'),
    },
    {
      path: '/classes',
      name: 'classes',
      component: AssignClassesView,
    },
    {
      path: '/students',
      name: 'students',
      component: AssignStudentsView,
    },
    {
      path: '/assign',
      name: 'assign',
      component: AssignExerciseView,
    },
    {
      path: '/design',
      name: 'design',
      component: DesignExerciseView,
    },
    {
      path: '/problem',
      name: 'problem',
      component: DesignProblemView,
    },
  ],
})

export default router
