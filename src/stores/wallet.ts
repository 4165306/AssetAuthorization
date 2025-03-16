import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BrowserProvider } from 'ethers'
import { networks } from '@/config/network'
function formatChainId(chainId: string | number): string {
  // 如果已经是 0x 开头的十六进制，直接返回
  if (typeof chainId === 'string' && chainId.startsWith('0x')) {
    return chainId
  }
  // 否则转换为十六进制
  return '0x' + Number(chainId).toString(16)
}
export const useWalletStore = defineStore('wallet', () => {
  const address = ref('')
  const isConnected = ref(false)
  const currentNetwork = ref('')

  const switchNetwork = async (networkName: keyof typeof networks = 'Monad Testnet') => {
    const network = networks[networkName]
    if (!network) throw new Error('Unsupported network')

    try {
      // 尝试切换到目标网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: formatChainId(network.chainId) }]
      })
    } catch (error: any) {
      // 如果网络不存在，则添加网络
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: formatChainId(network.chainId),
            chainName: networkName,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: [network.rpcUrl]
          }]
        })
      } else {
        throw error
      }
    }
    
    currentNetwork.value = networkName
  }

  const connect = async (networkName: keyof typeof networks = 'Monad Testnet') => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask')
      }
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      address.value = userAddress
      isConnected.value = true
      await switchNetwork(networkName)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const disconnect = () => {
    address.value = ''
    isConnected.value = false
    currentNetwork.value = ''
  }

  return {
    address,
    isConnected,
    currentNetwork,
    connect,
    disconnect,
    switchNetwork
  }
}) 