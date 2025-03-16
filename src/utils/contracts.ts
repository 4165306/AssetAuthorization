import { contractConfig } from '@/config/contract'
import { ethers } from 'ethers'

// 合约 ABI
const FACTORY_ABI = [
  "function createContract(address token, address[] calldata heirs, uint256[] calldata amounts, uint256[] calldata percentages) external returns (address)",
  "function getUserContracts(address user) external view returns (tuple(address contractAddress, address token, address owner, uint256[] amounts, uint256[] percentages, address[] heirs)[])",
  "function getContractsByHeir(address heir) external view returns (tuple(address contractAddress, address token, address owner, uint256[] amounts, uint256[] percentages, address[] heirs)[])",
  "event ContractCreated(address indexed owner, address indexed contractAddress, address indexed token, address[] heirs, uint256[] amounts, uint256[] percentages)"
]

// const USER_CONTRACT_ABI = [
//   "function approve(address token, uint256 amount) external",
//   "function unapprove(address token) external",
//   "function claim(address token) external",
//   "event TokenApproved(address indexed token, uint256 amount)",
//   "event TokenUnapproved(address indexed token)",
//   "event TokensClaimed(address indexed heir, address indexed token, uint256 amount)"
// ]

export interface ContractInfo {
  contractAddress: string
  token: string
  owner: string
  amounts: string[]
  percentages: string[]
  heirs: string[]
}

class InheritanceContracts {
  private provider: ethers.BrowserProvider
  private signer: ethers.Signer | null = null

  constructor(private contractAddress: string) {
    this.provider = new ethers.BrowserProvider(window.ethereum)
  }

  private async getSigner() {
    if (!this.signer) {
      this.signer = await this.provider.getSigner()
    }
    return this.signer
  }

  async createContract(token: string, heirs: string[], amounts: string[], percentages: string[]) {
    const signer = await this.getSigner()
    const factory = new ethers.Contract(this.contractAddress, FACTORY_ABI, signer)
    const tx = await factory.createContract(token, heirs, amounts, percentages)
    const receipt = await tx.wait()
    return receipt.contractAddress
  }

  async getUserContracts() {
    const factory = new ethers.Contract(this.contractAddress, FACTORY_ABI, this.provider)
    const signer = await this.getSigner()
    const address = await signer.getAddress()
    return await factory.getUserContracts(address)
  }

  async getContractsByHeir() {
    const factory = new ethers.Contract(this.contractAddress, FACTORY_ABI, this.provider)
    const signer = await this.getSigner()
    const address = await signer.getAddress()
    return await factory.getContractsByHeir(address)
  }
  
  
}

export const getInheritanceContract = (chainId: number): InheritanceContracts => {
  // @ts-ignore
  if (!contractConfig[chainId]) {
    throw new Error("Contract address not found")
  }
  // @ts-ignore
  const contractAddress = contractConfig[chainId].address
  return new InheritanceContracts(contractAddress)
}

// 继承合约操作类
export class UserInheritanceContract {
  
}