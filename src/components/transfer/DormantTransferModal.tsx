import { defineComponent, ref, reactive, nextTick } from 'vue'
import { NModal, NButton, NInput, useMessage, NIcon } from 'naive-ui'
import { TrashBin, Add } from '@vicons/ionicons5'
import { getChainId } from '@/utils/ethers'
import { getInheritanceContract } from '@/utils/contracts'
import { ethers } from 'ethers'

interface HeirConfig {
  address: string
  amount: string
  percentage: number
}

export default defineComponent({
  name: 'DormantTransferModal',
  props: {
    show: Boolean,
    tokenAddress: {
      type: String,
      required: true
    },
    tokenSymbol: String,
    tokenDecimals: {
      type: Number,
      default: 18
    }
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const message = useMessage()
    const loading = ref(false)

    // 继承人配置列表
    const heirs = reactive<HeirConfig[]>([
      { address: '', amount: '0', percentage: 0 }
    ])

    // 添加继承人并滚动到底部
    const addHeir = () => {
      heirs.push({ address: '', amount: '0', percentage: 0 })
      // 等待 DOM 更新后滚动
      nextTick(() => {
        const container = document.querySelector('.scroll-container')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }

    // 移除继承人
    const removeHeir = (index: number) => {
      if (heirs.length > 1) {
        heirs.splice(index, 1)
      }
    }

    // 验证配置
    const validateConfig = (): boolean => {
      // 检查地址是否都填写
      if (heirs.some(heir => !heir.address)) {
        message.error('Please fill in all heir addresses')
        return false
      }

      // 检查地址是否有效
      if (heirs.some(heir => !heir.address.match(/^0x[a-fA-F0-9]{40}$/))) {
        message.error('Invalid heir address format')
        return false
      }

      // 检查是否有重复地址
      const addresses = new Set(heirs.map(h => h.address.toLowerCase()))
      if (addresses.size !== heirs.length) {
        message.error('Duplicate heir addresses found')
        return false
      }

      // 检查分配方式
      let totalPercentage = 0
      for (const heir of heirs) {
        if (heir.amount !== '0' && heir.percentage !== 0) {
          message.error('Cannot set both amount and percentage for the same heir')
          return false
        }
        if (heir.amount === '0' && heir.percentage === 0) {
          message.error('Must set either amount or percentage for each heir')
          return false
        }
        totalPercentage += heir.percentage
      }

      // 检查百分比总和
      if (totalPercentage > 0 && totalPercentage !== 100) {
        message.error('Total percentage must be 100%')
        return false
      }

      return true
    }

    // 部署合约
    const handleDeploy = async () => {
      if (!validateConfig()) return

      try {
        loading.value = true
        const contract = getInheritanceContract(await getChainId())
        
        // 准备数据
        const heirAddresses = heirs.map(heir => heir.address)
        const amounts = heirs.map(heir => 
          heir.amount !== '0' ? ethers.parseUnits(heir.amount, props.tokenDecimals).toString() : '0'
        )
        const percentages = heirs.map(heir => 
          heir.percentage > 0 ? (heir.percentage * 100).toString() : '0'
        )

        // 打印调试信息
        console.log('Deploying contract with:', {
          token: props.tokenAddress,
          heirs: heirAddresses,
          amounts,
          percentages
        })

        await contract.createContract(
          props.tokenAddress,
          heirAddresses,
          amounts,
          percentages
        )
        message.success('Contract deployed successfully')
        emit('update:show', false)
      } catch (error) {
        console.error('Failed to deploy contract:', error)
        message.error('Failed to deploy contract')
      } finally {
        loading.value = false
      }
    }
    const inputStyle = {
      '--n-color': 'transparent',
      '--n-color-disabled': 'transparent',
      '--n-text-color': '#fff',
      '--n-border': '1px solid rgba(147, 51, 234, 0.2)',
      '--n-border-hover': '1px solid rgba(147, 51, 234, 0.4)',
      '--n-border-focus': '1px solid rgba(147, 51, 234, 0.6)',
      '--n-placeholder-color': 'rgba(255, 255, 255, 0.3)',
      '--n-color-focus': 'transparent',
      '--n-loading-color': 'rgba(147, 51, 234, 0.6)',
      '--n-caret-color': '#fff',
      '--n-height': '34px',
      '--n-padding': '0 12px'
    }

    return () => (
      <NModal show={props.show} onUpdateShow={(v) => emit('update:show', v)}>
        <div class="bg-gray-900 p-6 rounded-lg w-[50vh]">
          {/* 添加自定义滚动条样式的滚动区域 */}
          <div class="max-h-[50vh] overflow-y-auto mb-6 scroll-container" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(147, 51, 234, 0.5) transparent'
          }}>
            <h3 class="text-xl text-white mb-6">
              Setup Inheritance for {props.tokenSymbol}
            </h3>

            {/* Token Address */}
            <div class="mb-6">
              <label class="text-gray-400 block mb-2">Token Address</label>
              <NInput
                value={props.tokenAddress}
                disabled
                class="cyber-input"
                style={inputStyle}
              />
            </div>

            {/* Heirs Configuration */}
            <div class="space-y-4">
              {heirs.map((heir, index) => (
                <div key={index} class="border border-purple-800/20 rounded-lg p-4">
                  <div class="mb-4">
                    <div class="flex justify-between items-center mb-2">
                      <label class="text-gray-400">
                        Heir Address {index + 1}
                      </label>
                      {heirs.length > 1 && (
                        <NButton
                          circle
                          size="tiny"
                          type="error"
                          onClick={() => removeHeir(index)}
                        >
                          <NIcon>
                            <TrashBin />
                          </NIcon>
                        </NButton>
                      )}
                    </div>
                    <NInput
                      v-model={[heir.address, 'value']}
                      placeholder="0x..."
                      class="cyber-input"
                      style={inputStyle}
                    />
                  </div>
                  
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-gray-400 block mb-2">Amount</label>
                      <NInput
                        v-model={[heir.amount, 'value']}
                        inputProps={{
                          type: 'number',
                          min: '0'
                        }}
                        disabled={heir.percentage > 0}
                        placeholder="0"
                        class="cyber-input"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label class="text-gray-400 block mb-2">Percentage</label>
                      <NInput
                        v-model={[heir.percentage, 'value']}
                        inputProps={{
                          type: 'number',
                          min: '0',
                          max: '100'
                        }}
                        disabled={heir.amount !== '0'}
                        placeholder="0"
                        class="cyber-input"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Heir Button */}
            <div class="mt-4">
              <NButton
                class="cyber-button-secondary w-full"
                onClick={addHeir}
              >
                <NIcon class="mr-1">
                  <Add />
                </NIcon>
                Add Heir
              </NButton>
            </div>
          </div>

          {/* Action Buttons - 固定在底部 */}
          <div class="grid grid-cols-2 gap-4">
            <NButton 
              class="cyber-button-secondary" 
              onClick={() => emit('update:show', false)}
            >
              Cancel
            </NButton>
            
            <NButton
              class="cyber-button"
              loading={loading.value}
              onClick={handleDeploy}
            >
              <span class="text-white">Deploy</span>
            </NButton>
          </div>
        </div>
      </NModal>
    )
  }
}) 