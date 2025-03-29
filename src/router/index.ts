import { createRouter, createWebHistory } from 'vue-router'
import ChatBotView from '../views/ChatBotView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/chatbot',
      name: 'chatbot',
      component: ChatBotView,
    },
    {
      path: '/exercise',
      name: 'exercise',
      component: () => import('../views/ExerciseView.vue'),
    },
  ],
})

export default router
