import { defineComponent, onMounted, ref } from 'vue'
import { NButton } from 'naive-ui'
import CyberCard from '../common/CyberCard'
import { getRpcClient, type Token } from '@/utils/ethers'
import DormantTransferModal from '../transfer/DormantTransferModal'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: 'AssetList',
  setup() {
    const loading = ref(false)
    const data = ref<Token['TOKEN']['data']>()
    const showDormantTransfer = ref(false)
    const selectedToken = ref<any>(null)
    const router = useRouter()
    const showAssets = router.currentRoute.value.path.includes('assets')
    onMounted(async () => {
      try {
        loading.value = true
        const tokens = await getRpcClient('Monad Testnet').getTokens()
        data.value = tokens.TOKEN.data
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
      } finally {
        loading.value = false
      }
    })

    const handleDormantTransfer = (asset: any) => {
      selectedToken.value = asset
      showDormantTransfer.value = true
    }

    return () => (
      <>
        <CyberCard>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl text-white">Asset List</h3>
            <NButton class="cyber-button">Import Token</NButton>
          </div>
          
          {loading.value ? (
            <div class="flex justify-center items-center h-40">Loading...</div>
          ) : (
            <div class="space-y-4">
              {data.value?.map(asset => (
                <div v-show={showAssets && asset.contractAddress != '0x0000000000000000000000000000000000000000'} key={asset.contractAddress} class="bg-opacity-20 bg-purple-900 rounded-lg p-4 flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <img src={asset.imageURL} class="w-10 h-10 rounded-full" alt={asset.symbol} />
                    <div>
                      <div class="font-medium text-white">{asset.symbol}</div>
                      <div class="text-sm text-gray-400">{asset.contractAddress}</div>
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-white">
                      {asset.balance.length > 13 ? asset.balance.slice(0,10) + '...' : asset.balance}
                    </div>
                    <div class="text-sm text-gray-400">
                      {asset.decimal} decimals
                    </div>
                  </div>

                  <NButton 
                    size="small" 
                    class="cyber-button-secondary"
                    onClick={() => handleDormantTransfer(asset)}
                    
                  >
                    Dormant Transfer
                  </NButton>
                </div>
              ))}
            </div>
          )}
        </CyberCard>

        <DormantTransferModal
          v-model:show={showDormantTransfer.value}
          tokenAddress={selectedToken.value?.contractAddress}
          tokenSymbol={selectedToken.value?.symbol}
        />
      </>
    )
  }
}) 