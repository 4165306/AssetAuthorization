import { createRouter, createWebHistory } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import ConnectWallet from '@/components/wallet/ConnectWallet'
import Overview from '@/views/Overview'
import Assets from '@/views/Assets'
import LegacyPlan from '@/views/LegacyPlan'

const routes = [
  {
    path: '/',
    name: 'root',
    component: ConnectWallet,
    meta: { requiresAuth: false }
  },
  {
    path: '/overview',
    name: 'overview',
    component: Overview,
    meta: { requiresAuth: true }
  },
  {
    path: '/assets',
    name: 'assets',
    component: Assets,
    meta: { requiresAuth: true }
  },
  {
    path: '/legacy',
    name: 'legacy',
    component: LegacyPlan,
    meta: { requiresAuth: true }
  },
  // 添加一个通配符路由重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const walletStore = useWalletStore()
  
  if (to.meta.requiresAuth && !walletStore.isConnected) {
    // 保存目标路由
    sessionStorage.setItem('redirectPath', to.fullPath)
    next({ name: 'root' })
  } else if (walletStore.isConnected && to.name === 'root') {
    // 检查是否有保存的路由
    const redirectPath = sessionStorage.getItem('redirectPath')
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath')
      next(redirectPath)
    } else {
      next({ name: 'overview' })
    }
  } else {
    next()
  }
})

export default router