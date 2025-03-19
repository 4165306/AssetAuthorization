import { defineComponent, ref, onMounted, computed, reactive } from 'vue'
import { getRpcClient } from '@/utils/ethers'
import { NButton, NModal, NInput, useMessage, NIcon } from 'naive-ui'
import { Settings } from '@vicons/ionicons5'
import CyberCard from '../common/CyberCard'
import { networks } from '@/config/network'
import HourlyDistributionChart from './HourlyDistributionChart'
import { useWalletStore } from '@/stores/wallet'

export default defineComponent({
  name: 'GasStats',
  setup() {
    const message = useMessage()
    const loading = ref(true)
    const progress = ref(0)
    const selectedPeriod = ref<keyof typeof statsData>('all')
    const showSettingsModal = ref(false)
    const cacheTimeout = ref(180)  // 默认3分钟 (180秒)
    const batchSize = 100

    // 使用 reactive 来处理复杂的状态数据
    const statsData = reactive<{
      [key: string]: {
        totalGasFee: number
        transactionCount: number
        totalGasUsed: number
        averageGasPrice: number
        hourlyStats: {
          [timeSlot: string]: {
            transactions: number
            gasUsed: number
            gasFee: number
          }
        }
        activeDays: Set<string>
        activeWeeks: Set<string>
        activeMonths: Set<string>
      }
    }>({
      '1d': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      },
      '7d': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      },
      '15d': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      },
      '30d': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      },
      '180d': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      },
      '365d': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      },
      'all': { 
        totalGasFee: 0, 
        transactionCount: 0, 
        totalGasUsed: 0, 
        averageGasPrice: 0,
        hourlyStats: {
          '0-3': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '3-6': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '6-9': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '9-12': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '12-15': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '15-18': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '18-21': { transactions: 0, gasUsed: 0, gasFee: 0 },
          '21-24': { transactions: 0, gasUsed: 0, gasFee: 0 }
        },
        activeDays: new Set<string>(),
        activeWeeks: new Set<string>(),
        activeMonths: new Set<string>()
      }
    })

    const timeRanges = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '15d': 15 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '180d': 180 * 24 * 60 * 60 * 1000,
      '365d': 365 * 24 * 60 * 60 * 1000
    }

    const periodLabels = {
      '1d': '1 Day',
      '7d': '7 Days',
      '15d': '15 Days',
      '30d': '30 Days',
      '180d': '6 Months',
      '365d': '1 Year',
      'all': 'All Time'
    } as const

    // 修改计算属性
    const currentStats = computed(() => {
      return statsData[selectedPeriod.value as keyof typeof statsData]
    })

    const wallet = useWalletStore()

    const updateGasStats = async () => {
      const cache = localStorage.getItem(`__gasStats_${wallet.address}__`)
      if (cache) {
        const { timeout, stats: cachedStats } = JSON.parse(cache)
        if (timeout > new Date().getTime()) {
          // 正确恢复缓存的活跃统计数据
          Object.keys(cachedStats).forEach(period => {
            // 确保先创建新的 Set 对象
            statsData[period] = {
              ...cachedStats[period],
              // 将数组转换回 Set
              activeDays: new Set(cachedStats[period].activeDays || []),
              activeWeeks: new Set(cachedStats[period].activeWeeks || []),
              activeMonths: new Set(cachedStats[period].activeMonths || [])
            }
          })
          loading.value = false
          return 
        } else {
          localStorage.removeItem(`__gasStats_${wallet.address}__`)
        }
      }

      try {
        // 重置所有统计数据
        Object.keys(statsData).forEach(period => {
          statsData[period].activeDays.clear()
          statsData[period].activeWeeks.clear()
          statsData[period].activeMonths.clear()
        })

        const now = new Date().getTime()
        const txIterator = getRpcClient('Monad Testnet').getHistoryTransactions(0)
        let processedTxs = 0
        
        for await (const transactions of txIterator) {
          let batchCounter = 0
          
          for (const tx of transactions) {
            const txTime = tx.timestamp
            const txDate = new Date(txTime)
            const timeDiff = now - txTime
            const txHour = new Date(txTime).getHours()
            const timeSlot = getTimeSlot(txHour)
            
            // 更新活跃统计
            const dayKey = txDate.toISOString().split('T')[0]
            const weekKey = `${txDate.getFullYear()}-${getWeekNumber(txDate)}`
            const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`

            // 根据时间范围更新对应时期的活跃统计
            Object.entries(timeRanges).forEach(([period, range]) => {
              if (timeDiff <= range) {
                statsData[period].activeDays.add(dayKey)
                statsData[period].activeWeeks.add(weekKey)
                statsData[period].activeMonths.add(monthKey)
                updatePeriodStats(period, tx, timeSlot)
              }
            })
            
            // 更新全时段统计
            statsData['all'].activeDays.add(dayKey)
            statsData['all'].activeWeeks.add(weekKey)
            statsData['all'].activeMonths.add(monthKey)
            updatePeriodStats('all', tx, timeSlot)

            batchCounter++
            processedTxs++

            // Update UI after processing batchSize transactions
            if (batchCounter >= batchSize) {
              // Calculate averages for all periods
              Object.keys(statsData).forEach((period) => {
                if (statsData[period].transactionCount > 0) {
                  statsData[period].averageGasPrice = 
                    statsData[period].totalGasUsed / statsData[period].transactionCount
                }
              })

              // Force component update
              progress.value = processedTxs
              await new Promise(resolve => setTimeout(resolve, 0)) // Let UI update
              batchCounter = 0
            }
          }
        }

        // Final update
        Object.keys(statsData).forEach((period) => {
          if (statsData[period].transactionCount > 0) {
            statsData[period].averageGasPrice = 
              statsData[period].totalGasUsed / statsData[period].transactionCount
          }
        })

        loading.value = false
        
        // 缓存时序列化 Set
        setTimeout(() => { 
          const serializedStats = Object.keys(statsData).reduce((acc, period) => {
            acc[period] = {
              ...statsData[period],
              // 将 Set 转换为数组以便序列化
              activeDays: Array.from(statsData[period].activeDays),
              activeWeeks: Array.from(statsData[period].activeWeeks),
              activeMonths: Array.from(statsData[period].activeMonths)
            }
            return acc
          }, {} as any)

          localStorage.setItem(`__gasStats_${wallet.address}__`, JSON.stringify({
            stats: serializedStats,
            timeout: new Date().getTime() + cacheTimeout.value * 1000
          }))
        }, 0)
      } catch (error) {
        console.error('Failed to fetch gas stats:', error)
        loading.value = false
      }
    }

    onMounted(updateGasStats)

    // 在 return 语句之前添加这些辅助函数
    const getTimeSlot = (hour: number): string => {
      if (hour < 3) return '0-3'
      if (hour < 6) return '3-6'
      if (hour < 9) return '6-9'
      if (hour < 12) return '9-12'
      if (hour < 15) return '12-15'
      if (hour < 18) return '15-18'
      if (hour < 21) return '18-21'
      return '21-24'
    }

    const updatePeriodStats = (period: string, tx: any, timeSlot: string) => {
      statsData[period].totalGasUsed += tx.gasUsed
      statsData[period].totalGasFee += tx.transactionFee
      statsData[period].transactionCount += 1
      
      // 更新时段统计
      statsData[period].hourlyStats[timeSlot].transactions += 1
      statsData[period].hourlyStats[timeSlot].gasUsed += tx.gasUsed
      statsData[period].hourlyStats[timeSlot].gasFee += tx.transactionFee
    }

    // 保存设置
    const saveSettings = () => {
      if (cacheTimeout.value < 60) {
        message.warning('缓存时间不能小于60秒')
        return
      }
      localStorage.setItem('__gasStats_timeout__', cacheTimeout.value.toString())
      showSettingsModal.value = false
      updateGasStats()
      message.success('设置已保存')
    }

    // 初始化时读取保存的设置
    onMounted(() => {
      const savedTimeout = localStorage.getItem('__gasStats_timeout__')
      if (savedTimeout) {
        cacheTimeout.value = parseInt(savedTimeout)
      }
    })

    // 添加获取周数的辅助函数
    const getWeekNumber = (date: Date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    }

    return () => (
      <CyberCard>
        {loading.value ? (
          <div class="flex flex-col justify-center items-center h-20">
            <div>Processing transactions...</div>
            {progress.value > 0 && (
              <div class="text-sm text-gray-400">
                Processed {progress.value} transactions
              </div>
            )}
          </div>
        ) : (
          <div>
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center">
                <h3 class="text-xl text-white">Gas Overview</h3>
                <div class="mx-2 text-gray-500">
                  {`Update every ${Math.floor(cacheTimeout.value / 60)} minutes`}
                </div>
                <NButton
                  circle
                  size="tiny"
                  onClick={() => showSettingsModal.value = true}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(147, 51, 234, 0.5)',
                    color: 'rgba(147, 51, 234, 0.8)',
                    padding: '4px',
                    height: '24px',
                    width: '24px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      border: '1px solid rgba(147, 51, 234, 0.8)',
                      color: 'rgba(147, 51, 234, 1)'
                    }
                  }}
                >
                  <NIcon size={14}>
                    <Settings />
                  </NIcon>
                </NButton>
              </div>
              <div class="flex items-center space-x-2">
                <div class="flex space-x-2">
                  {Object.entries(periodLabels).map(([period, label]) => (
                    <button
                      key={period}
                      class={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedPeriod.value === period
                          ? 'bg-purple-300 text-purple-900'
                          : 'bg-purple-700 bg-opacity-20 text-gray-300 hover:bg-opacity-30'
                      }`}
                      onClick={() => {
                        selectedPeriod.value = period as keyof typeof statsData
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 第一行卡片 */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Gas Used</div>
                <div class="text-lg text-white">
                  {currentStats.value.totalGasUsed.toLocaleString()}
                </div>
              </div>
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Gas Fee</div>
                <div class="text-lg text-white">
                  {(currentStats.value.totalGasFee / 1e18).toFixed(4)} {networks['Monad Testnet'].nativeCurrency.symbol}
                </div>
              </div>
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Transactions</div>
                <div class="text-lg text-white">
                  {currentStats.value.transactionCount}
                </div>
              </div>
            </div>

            {/* 第二行卡片 */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Active Days</div>
                <div class="text-lg text-white">
                  {currentStats.value.activeDays.size}
                </div>
              </div>
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Active Weeks</div>
                <div class="text-lg text-white">
                  {currentStats.value.activeWeeks.size}
                </div>
              </div>
              <div class="bg-opacity-20 bg-purple-900 p-4 rounded-lg">
                <div class="text-sm text-gray-300">Active Months</div>
                <div class="text-lg text-white">
                  {currentStats.value.activeMonths.size}
                </div>
              </div>
            </div>

            {!loading.value && (
              <div class="mt-8">
                <h4 class="text-lg text-white mb-4">24-Hour Distribution</h4>
                <HourlyDistributionChart data={currentStats.value.hourlyStats} />
              </div>
            )}

            {/* 设置模态框 */}
            <NModal
              show={showSettingsModal.value}
              onUpdateShow={(v) => showSettingsModal.value = v}
            >
              <div class="bg-gray-900 p-6 rounded-lg w-[400px]">
                <h3 class="text-xl text-white mb-6">Cache Settings</h3>
                <div class="mb-6">
                  <label class="text-gray-400 block mb-2">
                    Cache Timeout (seconds)
                  </label>
                  <NInput
                    v-model={[cacheTimeout.value, 'value']}
                    inputProps={{
                      type: 'number',
                      min: 60,
                    }}
                    style={{
                      '--n-color': 'transparent',
                      '--n-color-disabled': 'transparent',
                      '--n-text-color': '#fff',
                      '--n-border': '1px solid rgba(147, 51, 234, 0.2)',
                      '--n-border-hover': '1px solid rgba(147, 51, 234, 0.4)',
                      '--n-border-focus': '1px solid rgba(147, 51, 234, 0.6)',
                      '--n-placeholder-color': 'rgba(255, 255, 255, 0.3)',
                      '--n-color-focus': 'transparent'
                    }}
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <NButton
                    class="cyber-button-secondary"
                    onClick={() => showSettingsModal.value = false}
                  >
                    Cancel
                  </NButton>
                  <NButton
                    class="cyber-button"
                    onClick={saveSettings}
                  >
                    Save
                  </NButton>
                </div>
              </div>
            </NModal>
          </div>
        )}
      </CyberCard>
    )
  }
}) 