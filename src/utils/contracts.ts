import { contractConfig } from '@/config/contract'
import { ethers, ContractTransactionResponse } from 'ethers'

// 合约 ABI
const FACTORY_ABI = [
  "function createContract(address token, address[] calldata heirs, uint256[] calldata amounts, uint256[] calldata percentages, uint256 unlockTime) external returns (address)",
  "function getUserContracts(address user) external view returns (tuple(address contractAddress, address token, address owner, uint256[] amounts, uint256[] percentages, address[] heirs)[])",
  "function getContractsByHeir(address heir) external view returns (tuple(address contractAddress, address token, address owner, uint256[] amounts, uint256[] percentages, address[] heirs)[])",
  "event ContractCreated(address indexed owner, address indexed contractAddress, address indexed token, address[] heirs, uint256[] amounts, uint256[] percentages)"
]

const USER_CONTRACT_ABI = [
  "function approve(address token, uint256 amount) external",
  "function unapprove(address token) external",
  "function claim(address token) external",
  "function getAllowance(address token) external view returns (bool isApproved, uint256 amount, uint256 unlockTime)",
  "function getHeirInfo(address heir) external view returns (bool isHeir, uint256 amount, uint256 percentage, uint256 unlockTime)",
  "function getContractInfo() external view returns (address owner, uint256 unlockTime)",
  "function updateUnlockTime(uint256 newUnlockTime) external",
  "event TokenApproved(address indexed token, uint256 amount, uint256 unlockTime)",
  "event TokenUnapproved(address indexed token)",
  "event TokensClaimed(address indexed heir, address indexed token, uint256 amount)",
  "event UnlockTimeUpdated(uint256 oldTime, uint256 newTime)"
]

export interface ContractInfo {
  contractAddress: string
  token: string
  owner: string
  amounts: string[]
  percentages: string[]
  heirs: string[]
  unlockTime: number
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

  async createContract(
    token: string, 
    heirs: string[], 
    amounts: string[], 
    percentages: string[],
    unlockTime: number
  ) {
    const signer = await this.getSigner()
    const factory = new ethers.Contract(this.contractAddress, FACTORY_ABI, signer)
    const tx = await factory.createContract(token, heirs, amounts, percentages, unlockTime)
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

// Add interface for contract methods
interface IUserInheritanceContract extends ethers.BaseContract {
  approve(token: string, amount: string): Promise<ContractTransactionResponse>;
  unapprove(token: string): Promise<ContractTransactionResponse>;
  claim(token: string): Promise<ContractTransactionResponse>;
  getAllowance(token: string): Promise<[boolean, bigint, bigint]>;
  getHeirInfo(heir: string): Promise<[boolean, bigint, bigint, bigint]>;
  getContractInfo(): Promise<[string, bigint]>;
  updateUnlockTime(newUnlockTime: number): Promise<ContractTransactionResponse>;
}

export class UserInheritanceContract {
  private provider: ethers.BrowserProvider
  private signer: ethers.Signer | null = null
  private contract: IUserInheritanceContract

  constructor(contractAddress: string) {
    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.contract = new ethers.Contract(contractAddress, USER_CONTRACT_ABI, this.provider) as unknown as IUserInheritanceContract
  }

  private async getSigner() {
    if (!this.signer) {
      this.signer = await this.provider.getSigner()
    }
    return this.signer
  }

  async approve(token: string, amount: string) {
    const signer = await this.getSigner()
    const contract = this.contract.connect(signer) as IUserInheritanceContract
    const tx = await contract.approve(token, amount)
    await tx.wait()
  }

  async unapprove(token: string) {
    const signer = await this.getSigner()
    const contract = this.contract.connect(signer) as IUserInheritanceContract
    const tx = await contract.unapprove(token)
    await tx.wait()
  }

  async claim(token: string) {
    const signer = await this.getSigner()
    const contract = this.contract.connect(signer) as IUserInheritanceContract
    const tx = await contract.claim(token)
    await tx.wait()
  }

  async getAllowance(token: string) {
    return await this.contract.getAllowance(token)
  }

  async getHeirInfo(heir: string) {
    return await this.contract.getHeirInfo(heir)
  }

  async getContractInfo() {
    return await this.contract.getContractInfo()
  }

  async updateUnlockTime(newUnlockTime: number) {
    const signer = await this.getSigner()
    const contract = this.contract.connect(signer) as IUserInheritanceContract
    const tx = await contract.updateUnlockTime(newUnlockTime)
    await tx.wait()
  }
}