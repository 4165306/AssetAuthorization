import { defineComponent, ref } from 'vue'
import { NModal, NButton, NTabs, NTabPane, NInput, NSpace, useMessage } from 'naive-ui'
import MonacoEditor from '@/components/common/MonacoEditor'
import { ethers } from 'ethers'
import { BrowserProvider } from 'ethers'
import DEFAULT_CONTRACT from '@/contracts/DormantTransfer.sol?raw'
import { getRpcClient } from '@/utils/ethers'

export default defineComponent({
  name: 'DormantTransferModal',
  props: {
    show: Boolean,
    tokenAddress: String,
    tokenSymbol: String
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    const message = useMessage()
    const loading = ref(false)
    const contractCode = ref(DEFAULT_CONTRACT)
    const deployedAddress = ref('')
    const activeTab = ref('code')
    const heirAddress = ref('0xf7ddb891f45676712049078c2651646077777777')
    const inactiveDays = ref(180)
    const compileProgress = ref('')

    const handleDeploy = async () => {
      try {
        loading.value = true
        compileProgress.value = ''
        
        // 创建 Web Worker
        const worker = new Worker(
          new URL('@/workers/compiler.worker.js', import.meta.url)
        )
        
        // 等待编译结果
        const contract: any = await new Promise((resolve, reject) => {
          worker.onmessage = (e) => {
            const { type, data } = e.data
            
            switch (type) {
              case 'progress':
                compileProgress.value = data
                break
              case 'success':
                resolve(data)
                break
              case 'error':
                reject(new Error(data))
                break
            }
          }
          
          worker.onerror = (error) => {
            reject(error)
          }
          
          // 发送合约代码到 worker
          worker.postMessage({ contractCode: contractCode.value })
        })
        // 获取 provider 和 signer
        const provider = new BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        
        // 创建合约工厂
        const factory = new ethers.ContractFactory(
          contract.abi,
          contract.evm.bytecode.object,
          signer
        )

        // 部署合约
        compileProgress.value = 'Deploying contract...'
        const deployedContract = await factory.deploy(
          heirAddress.value,
          inactiveDays.value * 24 * 60 * 60
        )
        
        compileProgress.value = 'Waiting for deployment...'
        await deployedContract.waitForDeployment()
        deployedAddress.value = await deployedContract.getAddress()
        // 授权代币
        compileProgress.value = 'Approving token...'
        const tokenContract = new ethers.Contract(
          props.tokenAddress!,
          ['function approve(address spender, uint256 amount) external returns (bool)'],
          signer
        )
        const tx2 = await tokenContract.approve(
          deployedAddress.value,
          ethers.MaxUint256
        )
        await tx2.wait()
        
        compileProgress.value = ''
        message.success('Contract deployed and token approved successfully')
      } catch (error) {
        console.error('Failed to deploy contract:', error)
        message.error('Failed to deploy contract')
      } finally {
        loading.value = false
      }
    }

    const handleClose = () => {
      emit('update:show', false)
    }

    return () => (
      <NModal
        show={props.show}
        onUpdateShow={handleClose}
        transformOrigin="center"
        style="width: 80vw; max-width: 1400px;"
      >
        <div class="bg-gray-900 p-6 rounded-lg">
          <h3 class="text-xl text-white mb-6">
            Setup Dormant Transfer for {props.tokenSymbol}
          </h3>
          
          <NTabs 
            v-model={[activeTab.value, 'value']}
            class="cyber-tabs"
            style={{
              '--n-tab-text-color': 'rgb(209 213 219)',
              '--n-tab-text-color-active': 'white',
              '--n-tab-text-color-hover': 'white',
              '--n-tab-text-color-disabled': 'rgba(255, 255, 255, 0.4)'
            }}
          >
            <NTabPane name="code" tab="Contract Code">
              <div class="h-[70vh] mb-4">
                <MonacoEditor
                  v-model={[contractCode.value, 'value']}
                  language="solidity"
                  theme="vs-dark"
                />
              </div>
            </NTabPane>
            
            <NTabPane name="settings" tab="Transfer Settings">
              <div class="space-y-4 py-4">
                <div>
                  <label class="text-gray-400 block mb-2">Heir Address</label>
                  <NInput
                    v-model={[heirAddress.value, 'value']}
                    placeholder="Enter the heir's wallet address"
                    class="cyber-input"
                    style={{
                      '--n-color': 'rgba(17, 24, 39, 0.7)',
                      '--n-color-hover': 'rgba(17, 24, 39, 0.9)',
                      '--n-color-focus': 'rgba(17, 24, 39, 0.9)',
                      '--n-text-color': 'white',
                      '--n-placeholder-color': 'rgba(156, 163, 175, 0.6)',
                      '--n-border': '1px solid rgba(147, 51, 234, 0.2)',
                      '--n-border-hover': '1px solid rgba(147, 51, 234, 0.4)',
                      '--n-border-focus': '1px solid rgba(147, 51, 234, 0.6)'
                    }}
                  />
                </div>
                
                <div>
                  <label class="text-gray-400 block mb-2">
                    Inactive Period (days)
                  </label>
                  <NInput
                    v-model={[inactiveDays.value, 'value']}
                    inputProps={{ type: 'number', min: 1 }}
                    placeholder="Enter inactive period in days"
                    class="cyber-input"
                    style={{
                      '--n-color': 'rgba(17, 24, 39, 0.7)',
                      '--n-color-hover': 'rgba(17, 24, 39, 0.9)',
                      '--n-color-focus': 'rgba(17, 24, 39, 0.9)',
                      '--n-text-color': 'white',
                      '--n-placeholder-color': 'rgba(156, 163, 175, 0.6)',
                      '--n-border': '1px solid rgba(147, 51, 234, 0.2)',
                      '--n-border-hover': '1px solid rgba(147, 51, 234, 0.4)',
                      '--n-border-focus': '1px solid rgba(147, 51, 234, 0.6)',
                    }}
                    onUpdateValue={(val) => {
                      // 确保输入的是正整数
                      const num = parseInt(val)
                      if (num && num > 0) {
                        inactiveDays.value = num
                      }
                    }}
                  />
                </div>
              </div>
            </NTabPane>
          </NTabs>

          <div class="grid grid-cols-2 gap-4 mt-6">
            <NButton 
              class="cyber-button-secondary" 
              onClick={handleClose}
            >
              Cancel
            </NButton>
            
            <NButton
              class="cyber-button"
              loading={loading.value}
              onClick={handleDeploy}
              disabled={!heirAddress.value || inactiveDays.value < 1}
            >
              <span class="text-white">Deploy & Approve</span>
            </NButton>
          </div>

          {deployedAddress.value && (
            <div class="mt-4">
              <div class="text-gray-400 mb-2">Deployed Contract Address</div>
              <div class="text-white break-all">{deployedAddress.value}</div>
            </div>
          )}

          {compileProgress.value && (
            <div class="mt-4 text-gray-400">
              {compileProgress.value}
            </div>
          )}
        </div>
      </NModal>
    )
  }
}) 