import { defineComponent } from 'vue'
import { NButton, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import CyberCard from '../common/CyberCard'

export default defineComponent({
  name: 'ConnectWallet',
  setup() {
    const router = useRouter()
    const walletStore = useWalletStore()

    const handleConnect = async () => {
      try {
        await walletStore.connect()
        
        // 检查是否有保存的路由路径
        const redirectPath = sessionStorage.getItem('redirectPath')
        if (redirectPath) {
          sessionStorage.removeItem('redirectPath')
          router.push(redirectPath)
        } else {
          router.push('/overview')
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
      }
    }

    return () => (
      <div class="cyber-bg min-h-screen flex items-center justify-center p-8">
        <CyberCard class="max-w-md w-full">
          <div class="text-center">
            <h1 class="text-3xl neon-text font-bold mb-6">Digital Legacy</h1>
            <p class="text-purple-200 mb-8">Connect your wallet to start your legacy planning</p>
            <NSpace vertical>
              <NButton
                class="cyber-button w-full"
                onClick={handleConnect}
                size="large"
              >
                Connect Wallet
              </NButton>
            </NSpace>
          </div>
        </CyberCard>
      </div>
    )
  }
}) 