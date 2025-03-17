import { defineComponent } from 'vue'
import { NButton, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'
import CyberCard from '../common/CyberCard'
import { useMessage } from 'naive-ui'

export default defineComponent({
  name: 'ConnectWallet',
  setup() {
    const router = useRouter()
    const walletStore = useWalletStore()
    const message = useMessage()

    const features = [
      {
        title: 'Smart Portfolio',
        description: 'Track and analyze your digital assets in real-time',
        icon: '💎'
      },
      {
        title: 'Cost Analytics',
        description: 'Optimize your transaction costs with smart insights',
        icon: '⚡'
      },
      {
        title: 'Activity Dashboard',
        description: 'Visualize and understand your blockchain activities',
        icon: '📊'
      },
      {
        title: 'Smart Alerts',
        description: 'Stay informed about important network activities',
        icon: '🔔'
      }
    ]

    const handleConnect = async () => {
      try {
        await walletStore.connect()
        const redirectPath = sessionStorage.getItem('redirectPath')
        if (redirectPath) {
          sessionStorage.removeItem('redirectPath')
          router.push(redirectPath)
        } else {
          router.push('/overview')
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        message.error((error as Error).message)
      }
    }

    return () => (
      <div class="cyber-bg min-h-screen flex flex-col items-center justify-center p-8">
        {/* 顶部网络信息 */}
        <div class="absolute top-4 right-4 flex items-center space-x-2">
          <div class="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
          <span class="text-green-400">{"Monad Testnet"}</span>
        </div>

        <div class="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
          {/* 左侧信息 */}
          <div class="space-y-6">
            <h1 class="text-4xl md:text-5xl neon-text font-bold">
              Digital Asset Explorer
            </h1>
            <p class="text-xl text-purple-200">
              Your intelligent dashboard for managing blockchain activities
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {features.map(feature => (
                <div key={feature.title} 
                  class="bg-purple-900 bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition-all duration-300"
                >
                  <div class="text-2xl mb-2">{feature.icon}</div>
                  <h3 class="text-lg font-semibold text-purple-200">{feature.title}</h3>
                  <p class="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧连接卡片 */}
          <CyberCard class="backdrop-blur-sm hover:shadow-purple-500/20 hover:shadow-lg transition-all duration-300">
            <div class="text-center p-8">
              <div class="text-6xl mb-6 animate-bounce">🌐</div>
              <h2 class="text-2xl neon-text font-bold mb-4">Start Exploring</h2>
              <p class="text-purple-200 mb-8">
                Connect your wallet to access your personalized dashboard
              </p>
              <NSpace vertical>
                <NButton
                  class="cyber-button w-full text-lg h-12"
                  onClick={handleConnect}
                  size="large"
                >
                  Connect Metamask
                </NButton>
                <div class="text-sm text-gray-400 mt-4">
                  Secure and private connection • No hidden fees
                </div>
              </NSpace>
            </div>
          </CyberCard>
        </div>

        {/* 底部信息 */}
        <div class="absolute bottom-4 text-center text-gray-400 text-sm">
          <p>Powered by Monad Network • Experience the Future of Digital Asset Management</p>
        </div>
      </div>
    )
  }
}) 