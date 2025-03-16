import { defineComponent } from 'vue'
import AssetList from '@/components/asset/AssetList'
import TopNav from '@/components/layout/TopNav'

export default defineComponent({
  name: 'Assets',
  setup() {
    return () => (
      <div class="cyber-bg min-h-screen">
        <TopNav />
        <div class="max-w-6xl mx-auto p-8">
          <AssetList />
        </div>
      </div>
    )
  }
}) 