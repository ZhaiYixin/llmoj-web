import { createRouter, createWebHistory } from 'vue-router'
import ChatBotView from '../views/ChatBotView.vue'
import ProblemListSearchPage from '../components/teacher/ProblemListSearchPage.vue'
import ProblemListDetailView from '../views/teacher/ProblemListDetailView.vue'

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
    {
      path: '/problem-lists',
      name: 'ProblemListSearch',
      component: ProblemListSearchPage,
    },
    {
      path: '/problem-lists/create',
      name: 'ProblemListCreate',
      component: ProblemListDetailView,
    },
    {
      path: '/problem-lists/:id',
      name: 'ProblemListDetail',
      component: ProblemListDetailView,
    },
  ],
})

export default router
