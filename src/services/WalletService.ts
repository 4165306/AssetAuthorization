import { useWalletStore } from '@/stores/wallet'
import type { Router } from 'vue-router'

export class WalletService {
  private store = useWalletStore()
  private router: Router

  constructor(router: Router) {
    this.router = router
  }

  init() {
    this.checkConnection()
    this.setupListeners()
  }

  private async checkConnection() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        if (accounts.length > 0) {
          this.store.$patch({ address: accounts[0] })
          this.router.push('/dashboard')
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err)
      }
    }
  }

  private setupListeners() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          this.store.disconnect()
          this.router.push('/')
        } else {
          this.store.$patch({ address: accounts[0] })
          this.router.push('/dashboard')
        }
      })

      window.ethereum.on('disconnect', () => {
        this.store.disconnect()
        this.router.push('/')
      })

      // 添加链切换监听
      window.ethereum.on('chainChanged', (_chainId: string) => {
        // 刷新页面以确保所有状态都是最新的
        window.location.reload()
      })
    }
  }
} 