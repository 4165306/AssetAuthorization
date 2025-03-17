import { defineComponent, ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import TopNav from '@/components/layout/TopNav'
import MyLegacyPlans from '@/components/legacy/MyLegacyPlans'
import InheritedPlans from '@/components/legacy/InheritedPlans'
import { getInheritanceContract } from '@/utils/contracts'
import { getRpcClient } from '@/utils/ethers'
import type { ContractInfo } from '@/utils/contracts'
import type { TokenInfo } from '@/utils/ethers'
import { getChainId } from '@/utils/ethers'

export default defineComponent({
  name: 'LegacyPlan',
  setup() {
    const message = useMessage()
    const myPlansLoading = ref(false)
    const heirPlansLoading = ref(false)
    const myContracts = ref<(ContractInfo & { tokenInfo?: TokenInfo })[]>([])
    const heirContracts = ref<ContractInfo[]>([])

    const loadContracts = async () => {
      try {
        myPlansLoading.value = true
        heirPlansLoading.value = true
        const contract = getInheritanceContract(await getChainId())
        const rpcClient = getRpcClient()
        
        // 获取我创建的合约
        const myContractsData = await contract.getUserContracts()
        
        // 转换合约数据格式
        const formattedContracts = myContractsData.map((contract: any) => ({
          contractAddress: contract[0],
          token: contract[1],
          owner: contract[2],
          amounts: Array.from(contract[3] || []).map(String),
          percentages: Array.from(contract[4] || []).map(String),
          heirs: Array.from(contract[5] || []).map(String)
        }))
        
        // 获取每个合约的代币信息
        const contractsWithTokenInfo = await Promise.all(
          formattedContracts.map(async (contract: any) => {
            try {
              const tokenInfo = await rpcClient.getTokenInfo(contract.token)
              return { ...contract, tokenInfo }
            } catch (error) {
              console.error(`Failed to fetch token info for ${contract.token}:`, error)
              return contract
            }
          })
        )
        
        myContracts.value = contractsWithTokenInfo
        myPlansLoading.value = false
        
        // 获取我作为继承人的合约
        const heirContractsData = await contract.getContractsByHeir()
        console.log('heirContractsData', heirContractsData)
        heirContracts.value = heirContractsData.map((contract: any[]) => ({
          contractAddress: contract[0],
          token: contract[1],
          owner: contract[2],
          amounts: Array.from(contract[3] || []).map(String),
          percentages: Array.from(contract[4] || []).map(String),
          heirs: Array.from(contract[5] || []).map(String)
        }))
        heirPlansLoading.value = false
      } catch (error) {
        console.error('Failed to load contracts:', error)
        message.error('Failed to load contracts')
        myPlansLoading.value = false
        heirPlansLoading.value = false
      }
    }

    onMounted(loadContracts)

    return () => (
      <div class="cyber-bg min-h-screen">
        <TopNav />
        <div class="max-w-6xl mx-auto p-8 space-y-8">
          <MyLegacyPlans 
            contracts={myContracts.value}
            loading={myPlansLoading.value}
          />
          <InheritedPlans 
            contracts={heirContracts.value}
            loading={heirPlansLoading.value}
          />
        </div>
      </div>
    )
  }
}) 