import { defineComponent } from 'vue'
import TopNav from '@/components/layout/TopNav'
import CyberCard from '@/components/common/CyberCard'

export default defineComponent({
  name: 'LegacyPlan',
  setup() {
    return () => (
      <div class="cyber-bg min-h-screen">
        <TopNav />
        <div class="max-w-6xl mx-auto p-8">
          <CyberCard>
            <h3 class="text-xl text-white mb-6">Legacy Planning</h3>
            <div class="text-gray-400">
              Legacy planning features coming soon...
            </div>
          </CyberCard>
        </div>
      </div>
    )
  }
}) 