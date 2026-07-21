import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Splash', component: () => import('@/views/SplashScreen.vue')  },
  { path: '/signin', name: 'Login', component: () => import('@/views/SignIn.vue')  },

  
 
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
