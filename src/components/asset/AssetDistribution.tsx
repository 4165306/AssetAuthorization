import { defineComponent, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  GridComponent,
  TooltipComponent,
  LegendComponent 
} from 'echarts/components'

use([
  CanvasRenderer,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

export default defineComponent({
  name: 'AssetDistribution',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const chartOptions = ref({
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
        data: props.data
      }]
    })

    return () => (
      <div class="h-[300px]">
        <VChart option={chartOptions.value} />
      </div>
    )
  }
}) 