import { defineComponent, ref } from 'vue'
import { NCard, NGrid, NGridItem, NTabs, NTabPane } from 'naive-ui'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, LineChart } from 'echarts/charts'
import { 
  GridComponent,
  TooltipComponent,
  LegendComponent 
} from 'echarts/components'

use([
  PieChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

export default defineComponent({
  name: 'Home',
  setup() {
    const activeTab = ref('assets')

    // 资产分布图表配置
    const assetDistributionOptions = ref({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: '#fff'
        }
      },
      series: [{
        name: '资产分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        data: [
          { value: 5.2, name: 'ETH' },
          { value: 12000, name: 'USDT' },
          { value: 3.1, name: 'BTC' },
          { value: 15000, name: 'NFTs' },
          { value: 8000, name: 'DeFi' }
        ]
      }]
    })

    return () => (
      <div class="cyber-bg min-h-screen p-8">
        <div class="max-w-6xl mx-auto">
          {/* 顶部标题 */}
          <div class="text-center mb-12">
            <h1 class="text-4xl neon-text font-bold mb-4">数字遗产管理</h1>
            <p class="text-purple-200 opacity-80">安全规划，永续传承</p>
          </div>

          {/* 主要内容区 */}
          <NTabs 
            value={activeTab.value} 
            onUpdateValue={(v) => activeTab.value = v}
            class="cyber-tabs"
          >
            {/* 资产概览 */}
            <NTabPane name="assets" tab="资产概览">
              <NGrid cols="1 xl:2" responsive="screen" xGap={24} yGap={24}>
                {/* 资产总览卡片 */}
                <NGridItem>
                  <NCard class="glass-card asset-card">
                    <div class="flex justify-between items-center mb-6">
                      <h3 class="text-xl text-white">总资产价值</h3>
                      <span class="text-2xl neon-text">$142,530.00</span>
                    </div>
                    <div class="h-[300px]">
                      <VChart option={assetDistributionOptions.value} />
                    </div>
                  </NCard>
                </NGridItem>
              </NGrid>
            </NTabPane>

            {/* 受益人管理 */}
            <NTabPane name="beneficiaries" tab="受益人管理">
              <NCard class="glass-card">
                {/* 受益人列表将在这里实现 */}
              </NCard>
            </NTabPane>

            {/* 祭奠空间（预留） */}
            <NTabPane name="memorial" tab="祭奠空间" disabled>
              <NCard class="glass-card">
                <div class="text-center text-purple-200 py-12">
                  功能开发中...
                </div>
              </NCard>
            </NTabPane>
          </NTabs>
        </div>
      </div>
    )
  }
})
