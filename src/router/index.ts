import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TabsLayout from '@/views/TabsLayout.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Splash', component: () => import('@/views/SplashScreen.vue')  },
  { path: '/signin', name: 'Login', component: () => import('@/views/SignIn.vue')  },
   {
    path: '/tabs',
    component: TabsLayout,
    children: [
      { path: '', redirect: '/tabs/dashboard' },
      { path: '/tabs/dashboard', name: 'Dashboard', component: () => import('@/views/Dashboard.vue') }
      
    ],
  },
  
 
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
