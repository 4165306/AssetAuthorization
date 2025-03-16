import { defineComponent, ref, onMounted } from 'vue'
import CyberCard from '../common/CyberCard'
import { getRpcClient } from '@/utils/ethers'

interface AssetSummary {
  tokens: {
    symbol: string;
    amount: string;
    decimal: number;
    imageURL: string;
  }[];
  nfts: {
    name: string;
    count: number;
    items: {
      image: string;
      name: string;
      tokenId: string;
    }[];
  }[];
}

export default defineComponent({
  name: 'AssetOverview',
  setup() {
    const assets = ref<AssetSummary>({
      tokens: [],
      nfts: []
    })
    const loading = ref(true)

    onMounted(async () => {
      try {
        const rpcClient = getRpcClient("Monad Testnet")
        const tokenData = await rpcClient.getTokens()
        // 处理代币数据
        assets.value.tokens = tokenData.TOKEN.data.map(token => ({
          symbol: token.symbol.length > 9 ? token.symbol.slice(0,7) + '...' : token.symbol,
          amount: token.balance.slice(0,8),
          decimal: token.decimal,
          imageURL: token.imageURL || '/default-token.png'
        }))

        // 处理 NFT 数据
        assets.value.nfts = tokenData.NFT.data.map(collection => ({
          name: collection.name || collection.symbol,
          count: collection.items.reduce((sum, item) => sum + Number(item.qty), 0),
          items: collection.items.map(item => ({
            image: item.image || '/default-nft.jpeg',
            name: item.name,
            tokenId: item.tokenId
          }))
        }))

        loading.value = false
      } catch (error) {
        console.error('Failed to fetch tokens:', error)
        loading.value = false
      }
    })

    return () => (
      <div class="space-y-6">
        {loading.value ? (
          <div class="flex justify-center items-center h-40">
            Loading...
          </div>
        ) : (
          <>
            {/* 代币卡片网格 */}
            <CyberCard>
              <h3 class="text-xl text-white mb-4">Token Holdings</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {assets.value.tokens.map(token => (
                  <div class="bg-opacity-20 bg-purple-900 rounded-lg p-4 hover:bg-opacity-30 transition-all">
                    <div class="flex items-center space-x-3 mb-2">
                      {token.imageURL && (
                        <img src={token.imageURL} class="w-8 h-8 rounded-full" />
                      )}
                      <span class="text-gray-300 font-medium">{token.symbol}</span>
                    </div>
                    <div class="text-white text-lg font-semibold">
                      {token.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CyberCard>

            {/* NFT 图片网格 */}
            {assets.value.nfts.length > 0 && (
              <CyberCard>
                <h3 class="text-xl text-white mb-4">NFT Collections</h3>
                <div class="space-y-6">
                  {assets.value.nfts.map(collection => (
                    <div class="space-y-3">
                      <div class="flex justify-between items-center">
                        <h4 class="text-lg text-white">{collection.name}</h4>
                        <span class="text-gray-400">{Number(collection.count).toLocaleString()} items</span>
                      </div>
                      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {collection.items.map(item => (
                          <div class="aspect-square bg-opacity-20 bg-purple-900 rounded-lg overflow-hidden hover:bg-opacity-30 transition-all">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                class="w-full h-full object-cover"
                              />
                            ) : (
                              <div class="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                            <div class="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-sm text-white truncate">
                              {item.name || `#${item.tokenId}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CyberCard>
            )}
          </>
        )}
      </div>
    )
  }
}) 