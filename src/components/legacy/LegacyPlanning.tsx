import { defineComponent } from 'vue'
import { NSpace, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'
import CyberCard from '../common/CyberCard'

export default defineComponent({
  name: 'LegacyPlanning',
  props: {
    beneficiaryCount: {
      type: Number,
      required: true
    },
    planStatus: {
      type: String,
      required: true
    },
    contractStatus: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()

    return () => (
      <CyberCard type="legacy">
        <h3 class="text-xl text-white mb-6">遗产规划</h3>
        <NSpace vertical size="large">
          <div class="flex justify-between items-center">
            <span class="text-purple-200">已设置受益人</span>
            <span class="text-white">{props.beneficiaryCount} 人</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-purple-200">资产分配计划</span>
            <span class="text-white">{props.planStatus}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-purple-200">智能合约状态</span>
            <span class={props.contractStatus === '已部署' ? 'text-green-400' : 'text-yellow-400'}>
              {props.contractStatus}
            </span>
          </div>
          <NButton 
            class="cyber-button w-full"
            onClick={() => router.push('/legacy-planning')}
          >
            管理遗产计划
          </NButton>
        </NSpace>
      </CyberCard>
    )
  }
}) 