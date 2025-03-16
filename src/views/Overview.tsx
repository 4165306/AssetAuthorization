import { defineComponent } from 'vue'
import { NGrid, NGridItem } from 'naive-ui'
import TopNav from '@/components/layout/TopNav'
import AssetOverview from '@/components/asset/AssetOverview'
import LegacyPlanning from '@/components/legacy/LegacyPlanning'
import GasStats from '@/components/stats/GasStats'

export default defineComponent({
  name: 'Overview',
  setup() {
    const assetData = [
      { value: 5.2, name: 'ETH' },
      { value: 12000, name: 'USDT' },
      { value: 3.1, name: 'BTC' },
      { value: 15000, name: 'NFTs' },
      { value: 8000, name: 'DeFi' }
    ]

    return () => (
      <div class="cyber-bg min-h-screen">
        <TopNav />
        <div class="max-w-6xl mx-auto p-8">
          <NGrid cols="1 xl:2" responsive="screen" xGap={24} yGap={24}>
            <NGridItem>
              <GasStats />
            </NGridItem>
            <NGridItem>
              <AssetOverview 
                totalValue="142,530.00"
                distribution={assetData}
              />
            </NGridItem>
          </NGrid>
        </div>
      </div>
    )
  }
}) 