import { defineComponent, ref, onMounted } from 'vue'
import { getRpcClient } from '@/utils/ethers'
import CyberCard from '../common/CyberCard'
import { networks } from '@/config/network'
import LocalStore from '@/stores/localstorage'

export default defineComponent({
  name: 'GasStats',
  setup() {
    const loading = ref(true)
    const stats = ref({
      totalGasUsed: 0,
      totalGasFee: 0,
      averageGasPrice: 0,
      transactionCount: 0
    })

    onMounted(async () => {
      try {
        const txInfo = await getRpcClient('Monad Testnet').getHistoryTransactions(0)
        stats.value.totalGasUsed = txInfo.transactions.reduce((acc, tx) => acc + tx.gasUsed, 0)
        stats.value.totalGasFee = txInfo.transactions.reduce((acc, tx) => acc + tx.transactionFee, 0)
        stats.value.transactionCount = txInfo.transactions.length
        stats.value.averageGasPrice = stats.value.totalGasUsed / stats.value.transactionCount
        loading.value = false
      } catch (error) {
        console.error('Failed to fetch gas stats:', error)
        loading.value = false
      }
    })

    return () => (
      <CyberCard>
        {loading.value ? (
          <div class="flex justify-center items-center h-20">Loading...</div>
        ) : (
          <div>
            <h3 class="text-xl text-white mb-4">Gas Overview</h3>
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Total Gas Used</div>
                <div class="text-xl text-white mt-1">{stats.value.totalGasUsed.toLocaleString()}</div>
              </div>
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Total Gas Fee</div>
                <div class="text-xl text-white mt-1">{(stats.value.totalGasFee / 1e18).toFixed(4)} {networks['Monad Testnet'].nativeCurrency.symbol}</div>
              </div>
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Transaction Count</div>
                <div class="text-xl text-white mt-1">{stats.value.transactionCount}</div>
              </div>
            </div>
          </div>
        )}
      </CyberCard>
    )
  }
}) 