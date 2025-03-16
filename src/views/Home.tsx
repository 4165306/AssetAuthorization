import { defineComponent, ref } from 'vue'
import { NGrid, NGridItem, NTabs, NTabPane } from 'naive-ui'
import AssetOverview from '@/components/asset/AssetOverview'
import LegacyPlanning from '@/components/legacy/LegacyPlanning'
import CyberCard from '@/components/common/CyberCard'
import AssetList from '@/components/asset/AssetList'

export default defineComponent({
  name: 'Home',
  setup() {
    const activeTab = ref('assets')

    const assetData = [
      { value: 5.2, name: 'ETH' },
      { value: 12000, name: 'USDT' },
      { value: 3.1, name: 'BTC' },
      { value: 15000, name: 'NFTs' },
      { value: 8000, name: 'DeFi' }
    ]

    return () => (
      <div class="cyber-bg min-h-screen p-8">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-12">
            <h1 class="text-4xl neon-text font-bold mb-4">数字遗产管理</h1>
            <p class="text-purple-200 opacity-80">安全规划，永续传承</p>
          </div>

          <NTabs 
            value={activeTab.value} 
            onUpdateValue={(v) => activeTab.value = v}
            class="cyber-tabs"
          >
            <NTabPane name="assets" tab="资产概览">
              <NGrid cols="1 xl:2" responsive="screen" xGap={24} yGap={24}>
                <NGridItem>
                  <AssetOverview 
                    totalValue="142,530.00"
                    distribution={assetData}
                  />
                </NGridItem>
                <NGridItem>
                  <LegacyPlanning 
                    beneficiaryCount={3}
                    planStatus="已完成"
                    contractStatus="已部署"
                  />
                </NGridItem>
              </NGrid>
              
              <div class="mt-6">
                <AssetList />
              </div>
            </NTabPane>

            <NTabPane name="beneficiaries" tab="受益人管理">
              <CyberCard>
                {/* 受益人列表组件将在这里实现 */}
              </CyberCard>
            </NTabPane>

            <NTabPane name="memorial" tab="祭奠空间" disabled>
              <CyberCard>
                <div class="text-center text-purple-200 py-12">
                  功能开发中...
                </div>
              </CyberCard>
            </NTabPane>
          </NTabs>
        </div>
      </div>
    )
  }
}) 