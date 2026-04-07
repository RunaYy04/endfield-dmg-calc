import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'calculator',
      component: () => import('../views/CalculatorView.vue')
    },
    {
      path: '/add-equipment',
      name: 'add-equipment',
      component: () => import('../views/AddEquipmentView.vue')
    },
    {
      path: '/add-buff',
      name: 'add-buff',
      component: () => import('../views/AddBuffView.vue')
    }
  ]
})

export default router