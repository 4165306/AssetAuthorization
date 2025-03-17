import { defineComponent, type PropType } from 'vue'
import { NButton, NEmpty, NSpin } from 'naive-ui'
import CyberCard from '@/components/common/CyberCard'
import type { ContractInfo } from '@/utils/contracts'
import type { TokenInfo } from '@/utils/ethers'
import ContractCard from './ContractCard'
import { useRouter } from 'vue-router'
export default defineComponent({
  name: 'MyLegacyPlans',
  props: {
    contracts: {
      type: Array as PropType<(ContractInfo & { tokenInfo?: TokenInfo })[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const router = useRouter()
    return () => (
      <CyberCard>
        <div class="relative">
          <NSpin show={props.loading}>
            {{
              default: () => (
                <div class="p-6">
                  <h2 class="text-2xl text-white mb-6 font-bold">My Legacy Plans</h2>
                  <div class="grid grid-cols-3 gap-4">
                    {props.contracts?.length > 0 ? (
                      props.contracts.map(contract => (
                        <ContractCard 
                          key={contract.contractAddress} 
                          contract={contract} 
                        />
                      ))
                    ) : (
                      <div class="col-span-3">
                        <NEmpty description="No legacy plans created yet">
                          <NButton class="cyber-button mt-4" onClick={() => router.push('/assets')}>
                            Create New Plan
                          </NButton>
                        </NEmpty>
                      </div>
                    )}
                  </div>
                </div>
              ),
              description: () => 'Loading...'
            }}
          </NSpin>
          {props.loading && (
            <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          )}
        </div>
      </CyberCard>
    )
  }
}) 