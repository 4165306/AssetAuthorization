import { defineComponent, ref, computed } from 'vue'
import { NMenu, NSelect, NButton } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

export default defineComponent({
  name: 'TopNav',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const walletStore = useWalletStore()
    const selectedChain = ref('monad')
    
    // 计算当前活动路由
    const activeKey = computed(() => route.path.slice(1) || 'overview')
    
    const chainOptions = [
      {
        label: 'Monad',
        value: 'monad',
        disabled: false
      },
      {
        label: 'Ethereum',
        value: 'ethereum',
        disabled: true
      },
      {
        label: 'Arbitrum',
        value: 'arbitrum',
        disabled: true
      }
    ]

    const menuOptions = [
      {
        label: () => 'Overview',
        key: 'overview',
      },
      {
        label: 'Assets',
        key: 'assets',
      },
      {
        label: 'Legacy Plan',
        key: 'legacy',
      },
      {
        label: 'Memorial',
        key: 'memorial',
        disabled: true
      }
    ]

    const handleUpdateValue = (key: string) => {
      router.push(`/${key}`)
    }

    const formatAddress = (address: string) => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return () => (
      <div class="cyber-nav">
        <div class="max-w-6xl mx-auto px-8 flex items-center h-16">
          <div class="flex items-center space-x-8 flex-1">
            <div class="text-2xl font-bold neon-text">Digital Legacy</div>
            <NSelect
              v-model={selectedChain.value}
              options={chainOptions}
              class="cyber-select !w-32"
              defaultValue="monad"
            />
            <NMenu
              value={activeKey.value}
              mode="horizontal"
              options={menuOptions}
              onUpdateValue={handleUpdateValue}
              class="!bg-transparent"
            />
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 bg-opacity-20 bg-purple-900 px-3 py-1.5 rounded-lg">
              <div class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span class="text-white text-sm font-medium">Monad</span>
            </div>
            <NButton class="cyber-button-secondary h-9">
              {formatAddress(walletStore.address || '0x0000000000000000000000000000000000000000')}
            </NButton>
          </div>
        </div>
      </div>
    )
  }
}) 