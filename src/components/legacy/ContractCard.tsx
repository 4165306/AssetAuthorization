import { defineComponent, type PropType } from 'vue'
import CyberCard from '@/components/common/CyberCard'
import type { ContractInfo } from '@/utils/contracts'
import type { TokenInfo } from '@/utils/ethers'

export default defineComponent({
  name: 'ContractCard',
  props: {
    contract: {
      type: Object as PropType<ContractInfo & { tokenInfo?: TokenInfo }>,
      required: true
    }
  },
  setup(props) {
    return () => {
      if (!props.contract || !props.contract.heirs) return null;
      
      // 确保数组是字符串数组
      const heirs = Array.isArray(props.contract.heirs) ? props.contract.heirs.map(String) : [];
      const amounts = Array.isArray(props.contract.amounts) ? props.contract.amounts.map(String) : [];
      const percentages = Array.isArray(props.contract.percentages) ? props.contract.percentages.map(String) : [];
      
      return (
        <CyberCard class="mb-4">
          <div class="p-4">
            <div class="flex items-start gap-4 mb-4">
              {/* Token Info */}
              <div class="flex-shrink-0">
                <img 
                  src={props.contract.tokenInfo?.imageURL || '/token-default.svg'} 
                  alt={props.contract.tokenInfo?.symbol || 'Token'} 
                  class="w-12 h-12 rounded-full"
                />
              </div>
              
              <div class="flex-grow">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-lg text-white mb-1">
                      {props.contract.tokenInfo?.name || 'Unknown Token'}
                      <span class="ml-2 text-sm text-gray-400">
                        {props.contract.tokenInfo?.symbol}
                      </span>
                    </h4>
                    <p class="text-sm text-gray-400 mb-1">
                      Contract: {props.contract.contractAddress}
                    </p>
                    {props.contract.tokenInfo && (
                      <div class="flex gap-4 text-sm text-purple-300">
                        <span>Decimals: {props.contract.tokenInfo.decimals}</span>
                        <span>Holders: {props.contract.tokenInfo.holders.toLocaleString()}</span>
                        <span>Transfers: {props.contract.tokenInfo.transfers.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {props.contract.tokenInfo?.verified && (
                    <div class="text-green-400 text-sm">Verified</div>
                  )}
                </div>
              </div>
            </div>

            {/* Heirs List */}
            {heirs.length > 0 && (
              <div class="space-y-2 mt-4">
                {heirs.map((heir, index) => (
                  <div key={index} class="flex justify-between items-center py-2 border-t border-purple-800/20">
                    <div class="text-purple-300">{heir}</div>
                    <div class="flex items-center space-x-4">
                      {amounts[index] !== '0' ? (
                        <span class="text-white">
                          Amount: {amounts[index]} {props.contract.tokenInfo?.symbol}
                        </span>
                      ) : (
                        <span class="text-white">
                          Percentage: {Number(percentages[index] || 0)/100}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CyberCard>
      )
    }
  }
}) 