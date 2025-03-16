import { defineComponent } from 'vue'
import { NCard } from 'naive-ui'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'CyberCard',
  props: {
    type: {
      type: String as PropType<'asset' | 'legacy' | 'default'>,
      default: 'default'
    }
  },
  setup(props, { slots }) {
    return () => (
      <NCard 
        class={[
          'glass-card',
          props.type === 'asset' && 'asset-card',
          props.type === 'legacy' && 'legacy-card'
        ].filter(Boolean).join(' ')}
      >
        {slots.default?.()}
      </NCard>
    )
  }
}) 