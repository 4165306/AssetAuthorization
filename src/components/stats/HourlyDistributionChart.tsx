import { defineComponent, ref, onMounted, watch, type PropType, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface HourlyStats {
  transactions: number
  gasUsed: number
  gasFee: number
}

interface HourlyStatsData {
  [timeSlot: string]: HourlyStats
}

export default defineComponent({
  name: 'HourlyDistributionChart',
  props: {
    data: {
      type: Object as PropType<HourlyStatsData>,
      required: true
    }
  },
  setup(props) {
    const chartRef = ref<HTMLDivElement>()
    const chart = ref<echarts.ECharts>()

    const initChart = () => {
      if (chartRef.value) {
        chart.value = echarts.init(chartRef.value)
      }
    }

    const updateChart = () => {
      if (!chart.value || !props.data) return

      const timeSlots = Object.keys(props.data)
      const transactionData = timeSlots.map(slot => Number(props.data[slot].transactions))

      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const param = params[0]
            return `${param.name}<br/>Transactions: ${param.value}`
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: timeSlots,
          axisLabel: {
            color: '#fff',
            interval: 0,  // 显示所有标签
            rotate: 0     // 如果标签太挤，可以调整这个角度
          }
        },
        yAxis: {
          type: 'value',
          name: 'Transactions',
          nameTextStyle: {
            color: '#fff'
          },
          axisLabel: {
            color: '#fff',
            // @ts-ignore
            formatter: (value: number) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}k`
              }
              return value
            }
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        series: [
          {
            name: 'Transactions',
            type: 'bar',
            data: transactionData,
            itemStyle: {
              color: '#8b5cf6'
            },
            barWidth: '60%',  // 调整柱子宽度
            label: {
              show: true,
              position: 'top',
              color: '#fff',
              formatter: (params: any) => {
                return params.value > 0 ? params.value : ''
              }
            }
          }
        ]
      }

      chart.value.setOption(option)
    }

    // 监听窗口大小变化
    const handleResize = () => {
      chart.value?.resize()
    }

    onMounted(() => {
      initChart()
      updateChart()
      window.addEventListener('resize', handleResize)
    })

    // 监听数据变化
    watch(() => props.data, () => {
      updateChart()
    }, { deep: true })

    // 组件卸载时清理
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      chart.value?.dispose()
    })

    return () => (
      <div ref={chartRef} class="w-full h-[400px]"></div>
    )
  }
}) 