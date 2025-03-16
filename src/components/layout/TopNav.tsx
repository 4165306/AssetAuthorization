import { defineComponent, computed } from 'vue'
import { NMenu, NDropdown, NButton, type DropdownOption } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { useWalletStore } from '@/stores/wallet'

export default defineComponent({
  name: 'TopNav',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const walletStore = useWalletStore()
    
    // 计算当前活动路由
    const activeKey = computed(() => route.path.slice(1) || 'overview')
    
    const networkOptions = [
      {
        label: 'Monad Testnet',
        key: 'monad',
        disabled: false
      },
      {
        label: 'Ethereum',
        key: 'ethereum',
        disabled: true
      },
      {
        label: 'Arbitrum',
        key: 'arbitrum',
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

    const handleNetworkSelect = (key: string) => {
      console.log('Network selected:', key)
      // 这里添加切换网络的逻辑
    }

    const formatAddress = (address: string) => {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    const dropdownProps = {
      trigger: 'click',
      options: networkOptions,
      onSelect: handleNetworkSelect
    } as const

    return () => (
      <div class="cyber-nav">
        <div class="max-w-6xl mx-auto px-8 flex items-center h-16">
          <div class="flex items-center space-x-8 flex-1">
            <div class="text-2xl font-bold neon-text">Digital Asset</div>
            <NMenu
              value={activeKey.value}
              mode="horizontal"
              options={menuOptions}
              onUpdateValue={handleUpdateValue}
              class="!bg-transparent"
            />
          </div>
          
          <div class="flex items-center space-x-4">
            <NDropdown 
              {...dropdownProps}
              renderLabel={(option: DropdownOption) => {
                return (
                  <span class="text-purple-400 text-sm font-medium">{option.label}</span>
                )
              }}
              onSelect={handleNetworkSelect}
            >
              <div class="flex items-center space-x-2 bg-opacity-20 bg-purple-900 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-opacity-30 transition-all duration-300">
                <div class="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-white text-sm font-medium">Monad Testnet</span>
                <div class="i-carbon-chevron-down text-white"></div>
              </div>
            </NDropdown>
            <NButton class="cyber-button-secondary h-9">
              {formatAddress(walletStore.address || '0x0000000000000000000000000000000000000000')}
            </NButton>
          </div>
        </div>
      </div>
    )
  }
}) 