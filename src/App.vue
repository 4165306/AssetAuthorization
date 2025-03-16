<script lang="ts">
import { defineComponent } from 'vue'
import { NMessageProvider, NConfigProvider } from 'naive-ui'

export default defineComponent({
  name: 'App',
  components: {
    NMessageProvider,
    NConfigProvider
  }
})
</script>

<template>
  <n-config-provider :theme-overrides="{ common: { primaryColor: '#4e4eff' } }">
    <n-message-provider>
      <div class="app-root cyber-bg">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
.app-root {
  min-height: 100vh;
  width: 100%;
}

.cyber-bg {
  background: 
    linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.7)),
    radial-gradient(circle at 50% 50%, rgba(76, 0, 255, 0.1), transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(255, 0, 136, 0.1), transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(0, 255, 255, 0.1), transparent 50%);
  color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
