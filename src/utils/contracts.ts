import { ethers } from 'ethers'

// 合约 ABI
const FACTORY_ABI = [
  "function createContract(address token, address[] calldata heirs, uint256[] calldata amounts, uint256[] calldata percentages) external returns (address)",
  "function getUserContracts(address user) external view returns (tuple(address contractAddress, address token, address owner, uint256[] amounts, uint256[] percentages, address[] heirs)[])",
  "function getContractsByHeir(address heir) external view returns (tuple(address contractAddress, address token, address owner, uint256[] amounts, uint256[] percentages, address[] heirs)[])",
  "event ContractCreated(address indexed owner, address indexed contractAddress, address indexed token, address[] heirs, uint256[] amounts, uint256[] percentages)"
]

const USER_CONTRACT_ABI = [
  "function approve(address token, uint256 amount) external",
  "function unapprove(address token) external",
  "function claim(address token) external",
  "event TokenApproved(address indexed token, uint256 amount)",
  "event TokenUnapproved(address indexed token)",
  "event TokensClaimed(address indexed heir, address indexed token, uint256 amount)"
]

export interface ContractInfo {
  contractAddress: string
  token: string
  owner: string
  amounts: string[]
  percentages: string[]
  heirs: string[]
}

class InheritanceContracts {
  constructor(private contractAddress: string) {}

  async createContract(token: string, heirs: string[], amounts: string[], percentages: string[]) {
    // @ts-ignore
    const provider = ethers.BrowserProvider(window.ethereum)
    const factory = new ethers.Contract(this.contractAddress, FACTORY_ABI, provider)
    const tx = await factory.createContract(token, heirs, amounts, percentages)
    const receipt = await tx.wait()
    return receipt.contractAddress
  }

  async getUserContracts() {
    const userContract = new ethers.Contract(this.contractAddress, USER_CONTRACT_ABI)
    const contracts = await userContract.getUserContracts()
    return contracts
  }

  async getContractsByHeir() {
    const userContract = new ethers.Contract(this.contractAddress, USER_CONTRACT_ABI)
    const contracts = await userContract.getContractsByHeir()
    return contracts
  }
  
  
}

export const getInheritanceContract = (contractAddress: string) => {
  return new InheritanceContracts(contractAddress)
}

// 继承合约操作类
export class UserInheritanceContract {
  
}