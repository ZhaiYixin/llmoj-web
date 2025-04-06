import { createRouter, createWebHistory } from 'vue-router'
import ChatBotView from '../views/ChatBotView.vue'
import AssignView from '../views/teacher/AssignView.vue'
import DesignView from '../views/teacher/DesignView.vue'
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
      path: '/assign',
      name: 'assign',
      component: AssignView,
    },
    {
      path: '/design',
      name: 'design',
      component: DesignView,
    },
    {
      path: '/problem',
      name: 'problem',
      component: DesignProblemView,
    },
  ],
})

export default router
