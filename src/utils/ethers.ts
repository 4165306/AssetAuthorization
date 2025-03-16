import { networks } from "@/config/network";
import { BrowserProvider, getAddress } from "ethers";
// @ts-ignore
import { HmacSHA256, MD5 } from "crypto-js";
import proxy from "@/config/proxy";

class AbstructEthers {
  protected provider: BrowserProvider;
  constructor(provider: BrowserProvider) {
    this.provider = provider;
  }
}

export interface VerifyContractOptions {
  address: string;
  compilerType: string;
  compilerVersion: string;
  contractLicense: string;
  contractName: string;
  files: string
}

export interface RpcClient {
  connect(): Promise<string>;
  getTokens(): Promise<Token>;
  getTokenBalance(tokenAddress: string): Promise<string>;
  getHistoryTransactions(csr: number): AsyncGenerator<Transaction[], void, unknown>;
  changeNetwork(chainId: number): Promise<string>;
  getERC20Tokens(): Promise<Token['TOKEN']['data']>;
  verifyContract(options: VerifyContractOptions): Promise<boolean>;
}

export interface Transaction {
  blockHash: string;
  blockNumber: number;
  contractAddress: string;
  from: string;
  fromAddress: {
    address: string;
    ens: string;
    isContract: boolean;
    isContractCreated: boolean;
    name: string;
    type: string;
    verified: boolean;
  },
  gasUsed: number;
  hash: string;
  idStr: string;
  methodID: string;
  nonce: number;
  status: number;
  timestamp: number;
  to: string;
  toAddress: {
    address: string;
    ens: string;
    isContract: boolean;
    isContractCreated: boolean;
    name: string;
    type: string;
    verified: boolean;
  },
  transactionFee: number;
  transactionIndex: number;
  value: string;
}

export interface Token {
  "TOKEN": {
    data: {
      contractAddress: string;
      balance: string;
      decimal: number;
      imageURL: string;
      symbol: string
    }[];
    total: number;
  },
  "NFT": {
    data: {
      contractAddress: string;
      image: string;
      symbol: string;
      ercStandard: string;
      name: string;
      verified: boolean;
      items: {
        contractAddress: string;
        image: string;
        name: string;
        qty: number;
        tokenId: string;
      }[]
    }[];
    total: number;
  }
}

class MonadRpc extends AbstructEthers implements RpcClient {
  private address: string | null = null;

  // use window.ethereum to connect to the network
  constructor() {
    super(
      new BrowserProvider(window.ethereum)
    )
  }

  async connect(): Promise<string> {
    const accounts = await this.provider.send("eth_requestAccounts", []);
    if (!accounts[0]) throw new Error("No account found");
    this.address = getAddress(accounts[0]);
    return this.address as string;
  }

  async getTokens(_address: string = ""): Promise<Token> {
    const address = _address || (this.address ?? await this.connect())
    const tokenUrl = `/testnet/api/account/tokenPortfolio?address=${address}&pageSize=100&pageIndex=1`
    const NFTUrl = `/testnet/api/account/nfts?address=${address}&pageSize=100&pageIndex=1`
    const tokenSignure = this.getAppidAndSecret(tokenUrl)
    const nftSignure = this.getAppidAndSecret(NFTUrl)
    const tokens = fetch(proxy.proxy.url + tokenUrl, {
      headers: {
        "x-app-id": tokenSignure.appId,
        "x-api-signature": tokenSignure.secret,
        "x-api-timestamp": tokenSignure.timestamp,
        "P-PROXY-HOST": networks["Monad Testnet"].apiUrl  
      }
    })
      const nfts = fetch(proxy.proxy.url + NFTUrl, {
      headers: {
        "x-app-id": nftSignure.appId,
        "x-api-signature": nftSignure.secret,
        "x-api-timestamp": nftSignure.timestamp,
        "P-PROXY-HOST": networks["Monad Testnet"].apiUrl
      }
    })
    const [tokensResponse, nftsResponse] = await Promise.all([tokens, nfts])
    const tokensData = await tokensResponse.json()
    const nftsData = await nftsResponse.json()
    return {
      "TOKEN": tokensData.result,
      "NFT": nftsData.result
    }
  }

  async getERC20Tokens(): Promise<Token['TOKEN']['data']> {
    const address = this.address ?? await this.connect()
    const tokenUrl = `/testnet/api/account/tokenPortfolio?address=${address}&pageSize=100&pageIndex=1`
    const tokenSignure = this.getAppidAndSecret(tokenUrl)
    const tokens = await fetch(proxy.proxy.url + tokenUrl, {
      headers: {
        "x-app-id": tokenSignure.appId,
        "x-api-signature": tokenSignure.secret,
        "x-api-timestamp": tokenSignure.timestamp,
        "P-PROXY-HOST": networks["Monad Testnet"].apiUrl
      }
    })
    const tokensData = await tokens.json()
    return tokensData.result.data
  }

  async getTokenBalance(tokenAddress: string) {
    const balance = await this.provider.send("eth_getTokenBalance", [tokenAddress]);
    return balance;
  }


  async *getHistoryTransactions(csr: number = 0, _address: string = ''): AsyncGenerator<Transaction[], void, unknown> {
    const address = _address || (this.address ?? await this.connect());
    const api = `/testnet/api/account/transactions?address=${address}`;
    let cursor = csr;
    try {
      while(true) {
        let request_url = cursor !== 0 ? `${api}&cursor=${cursor}` : api;
        const signure = this.getAppidAndSecret(request_url);
        
        const response = await fetch(proxy.proxy.url + request_url, {
          headers: {
            "x-app-id": signure.appId,
            "x-api-signature": signure.secret,
            "x-api-timestamp": signure.timestamp,
            "P-PROXY-HOST": networks["Monad Testnet"].apiUrl
          }
        });
        
        const data = await response.json();
        const newTransactions = data.result.data;
        yield(newTransactions)
        
        if (data.result.nextPageCursor) {
          cursor = data.result.nextPageCursor;
          // 每次获取新数据后更新统计缓存
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        } else {
          break;
        }
      }
    } catch (error) {
      throw new Error('Failed to fetch transactions');
    }
  }

  async changeNetwork(chainId: number) {
    const result = await this.provider.send("wallet_switchEthereumChain", [{ chainId: chainId.toString() }]);
    if (result.error && result.error.code === 4902) {
      await this.addNetwork(chainId, networks['Monad Testnet'].rpcUrl, "Monad Testnet", networks['Monad Testnet'].nativeCurrency.symbol, networks['Monad Testnet'].nativeCurrency.decimals);
    }
    return result;
  }

  async addNetwork(chainId: number, rpcUrl: string, chainName: string, symbol: string, decimals: number) {
    const result = await this.provider.send("wallet_addEthereumChain", [{ chainId: chainId.toString(), rpcUrl, chainName, symbol, decimals }]);
    return result;
  }

  async verifyContract(options: VerifyContractOptions): Promise<boolean> {
    const api = '/testnet/api/verifyContractV2/verify/solc'
    const signure = this.getAppidAndSecret(api)
    const response = await fetch(proxy.proxy.url + api, {
      headers: {
        "x-app-id": signure.appId,
        "x-api-signature": signure.secret,
        "x-api-timestamp": signure.timestamp,
        "Content-Type": "application/json"
      },
      method: 'POST',
      body: JSON.stringify(options)
    })
    const data = await response.json()
    if (data.code === 0) {
      return true
    }
    console.log(data)
    throw new Error(data.message)
  }

  /**
   * request_full_url like this: /testnet/api/account/tokenPortfolio?address=${address}&pageSize=5&pageIndex=1
   */
  private getAppidAndSecret(request_full_url: string) {
    const n = new Date().getTime().toString().slice(0, -3)
    const input = '8063-'.concat(n.toString())
    const key = 'monad-secret'
    const i = HmacSHA256(input, key).toString()
    let appId = ''
    for (let e = 0; e < i.length; e++) e % 2 == 1 && (appId += i[e]);
    let secret = ''
    let l = MD5(request_full_url + appId + n).toString()
    for (let e = 0; e < l.length; e += 2) secret += l[e + 1] + l[e];
    return { appId, secret, timestamp: n.toString() }
  }
}


export function getRpcClient(chainName: keyof typeof networks = 'Monad Testnet'): RpcClient {
  if (!networks[chainName]) {
    throw new Error("Unsupported chainId");
  }
  switch (chainName) {
    case "Monad Testnet":
      return new MonadRpc();
    default:
      throw new Error("Unsupported chainId");
  }
}

