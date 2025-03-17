import { defineComponent, ref, type PropType, computed, onMounted } from 'vue'
import { NButton, NPopover, useMessage } from 'naive-ui'
import { formatUnits } from 'ethers'
import { UserInheritanceContract } from '@/utils/contracts'
import { getRpcClient } from '@/utils/ethers'
import type { ContractInfo } from '@/utils/contracts'
import type { TokenInfo } from '@/utils/ethers'

const formatAddress = (address: string, length: number = 10) => {
  return address.slice(0, length) + '...' + address.slice(-length)
}

export default defineComponent({
  name: 'ContractCard',
  props: {
    contract: {
      type: Object as PropType<ContractInfo & { tokenInfo?: TokenInfo }>,
      required: true
    },
    isInherited: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const message = useMessage()
    const loading = ref(false)
    const unapprovingLoading = ref(false)
    const showAllHeirs = ref(false)
    const tokenInfo = ref<TokenInfo | null>(null)
    const unlockTime = ref<number>(0)

    onMounted(async () => {
      try {
        const rpc = getRpcClient()
        tokenInfo.value = await rpc.getTokenInfo(props.contract.token)

        const contract = new UserInheritanceContract(props.contract.contractAddress)
        const [, , _unlockTime] = await contract.getAllowance(props.contract.token)
        unlockTime.value = Number(_unlockTime)
      } catch (error) {
        console.error('Failed to fetch contract info:', error)
      }
    })

    const isUnlockTimeReached = computed(() => {
      return Date.now() >= unlockTime.value * 1000
    })

    const handleClaim = async () => {
      try {
        loading.value = true
        const contract = new UserInheritanceContract(props.contract.contractAddress)
        await contract.claim(props.contract.token)
        message.success('Successfully claimed')
      } catch (error) {
        console.error('Failed to claim:', error)
        message.error('Failed to claim')
      } finally {
        loading.value = false
      }
    }

    const handleUnapprove = async () => {
      try {
        unapprovingLoading.value = true
        const contract = new UserInheritanceContract(props.contract.contractAddress)
        await contract.unapprove(props.contract.token)
        message.success('Successfully unapproved')
      } catch (error) {
        console.error('Failed to unapprove:', error)
        message.error('Failed to unapprove')
      } finally {
        unapprovingLoading.value = false
      }
    }

    const formatTime = (timestamp: number) => {
      return new Date(timestamp * 1000).toLocaleString()
    }

    const displayedHeirs = computed(() => {
      if (showAllHeirs.value || props.contract.heirs.length <= 3) {
        return props.contract.heirs
      }
      return props.contract.heirs.slice(0, 3)
    })

    const renderHeirInfo = (heir: string, index: number) => (
      <div key={heir} class="bg-gray-700 rounded px-3 py-1 text-sm flex items-center gap-2">
        <span class="text-gray-300">{formatAddress(heir, 6)}</span>
        <span class="text-white">
          {formatUnits(props.contract.amounts[index], tokenInfo.value?.decimals || 18)} {tokenInfo.value?.symbol || '???'}
        </span>
        <span class="text-gray-400">({Number(props.contract.percentages[index]) / 100}%)</span>
      </div>
    )

    return () => (
      <div class="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* 头部：代币信息和操作按钮 */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-xl text-white font-medium">
              {tokenInfo.value?.symbol || formatAddress(props.contract.token)}
            </span>
            <span class="text-green-400 text-sm">Verified</span>
          </div>
          <div class="flex items-center gap-2">
            {!props.isInherited && (
              <NButton
                size="tiny"
                type="error"
                ghost
                loading={unapprovingLoading.value}
                onClick={handleUnapprove}
              >
                UnApprove
              </NButton>
            )}
            {props.isInherited && (
              <NButton
                size="small"
                type="primary"
                loading={loading.value}
                disabled={!isUnlockTimeReached.value}
                onClick={handleClaim}
              >
                {isUnlockTimeReached.value ? 'Claim' : 'Locked'}
              </NButton>
            )}
          </div>
        </div>

        {/* 合约信息 */}
        <div class="grid grid-cols-1 gap-x-8 gap-y-2 text-sm">
          <div>
            <span class="text-gray-400">Contract:</span>
            <span class="text-white ml-2">{formatAddress(props.contract.contractAddress)}</span>
          </div>
          <div>
            <span class="text-gray-400">Token:</span>
            <span class="text-white ml-2">{formatAddress(props.contract.token)}</span>
          </div>
          <div>
            <span class="text-gray-400">Owner:</span>
            <span class="text-white ml-2">{formatAddress(props.contract.owner)}</span>
          </div>
          <div>
            <span class="text-gray-400">Unlock:</span>
            <span class="text-white ml-2">{formatTime(unlockTime.value)}</span>
          </div>
        </div>

        {/* 继承人信息 - 只在非继承视图中显示 */}
        {!props.isInherited && (
          <div class="space-y-2">
            <div class="flex flex-wrap gap-2">
              {displayedHeirs.value.map((heir, index) => renderHeirInfo(heir, index))}
            </div>
            {props.contract.heirs.length > 3 && (
              <NPopover trigger="click">
                {{
                  trigger: () => (
                    <NButton 
                      text 
                      type="primary" 
                      size="tiny"
                      class="mt-1"
                      onClick={() => showAllHeirs.value = !showAllHeirs.value}
                    >
                      {showAllHeirs.value ? 'Show Less' : `+${props.contract.heirs.length - 3} more`}
                    </NButton>
                  ),
                  default: () => (
                    <div class="max-w-md space-y-2">
                      {props.contract.heirs.slice(3).map((heir, index) => 
                        renderHeirInfo(heir, index + 3)
                      )}
                    </div>
                  )
                }}
              </NPopover>
            )}
          </div>
        )}
      </div>
    )
  }
}) 