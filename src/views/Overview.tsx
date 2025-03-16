import { defineComponent } from 'vue'
import { NGrid, NGridItem } from 'naive-ui'
import TopNav from '@/components/layout/TopNav'
import AssetOverview from '@/components/asset/AssetOverview'
import GasStats from '@/components/stats/GasStats'

export default defineComponent({
  name: 'Overview',
  setup() {
    return () => (
      <div class="cyber-bg min-h-screen">
        <TopNav />
        <div class="max-w-6xl mx-auto p-8">
          <NGrid cols="1 xl:2" responsive="screen" xGap={24} yGap={24}>
            <NGridItem>
              <GasStats />
            </NGridItem>
            <NGridItem>
              <AssetOverview />
            </NGridItem>
          </NGrid>
        </div>
      </div>
    )
  }
}) 