import { createApp } from 'vue'
import './style.css'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { WalletService } from './services/WalletService'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 在应用挂载后初始化钱包服务
app.mount('#app')

const walletService = new WalletService(router)
walletService.init()
