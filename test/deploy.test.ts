import { getRpcClient } from '../src/utils/ethers'
import fs from 'fs'
import { describe, expect, it, vi } from 'vitest'

const rpcClient = getRpcClient('Monad Testnet')

const contractCode = fs.readFileSync('./src/contracts/DormantTransfer.sol', 'utf-8')

const metadatajson = `
{"compiler":{"version":"0.8.19+commit.7dd6d404"},"language":"Solidity","output":{"abi":[{"inputs":[{"internalType":"address","name":"_heir","type":"address"},{"internalType":"uint256","name":"_inactiveTime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"heir","type":"address"},{"indexed":false,"internalType":"uint256","name":"inactiveTime","type":"uint256"}],"name":"InheritanceSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"}],"name":"TokenApproved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"}],"name":"approveToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"approvedTokens","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"inheritanceSettings","outputs":[{"internalType":"address","name":"heir","type":"address"},{"internalType":"uint256","name":"inactiveTime","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"lastActivity","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"tokenAddress","type":"address"}],"name":"transferToken","outputs":[],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"kind":"dev","methods":{},"version":1},"userdoc":{"kind":"user","methods":{},"version":1}},"settings":{"compilationTarget":{"DormantTransfer.sol":"DormantTransfer"},"evmVersion":"london","libraries":{},"metadata":{"bytecodeHash":"ipfs"},"optimizer":{"enabled":false,"runs":200},"remappings":[]},"sources":{"DormantTransfer.sol":{"keccak256":"0xaf07cd795388f00795f2d6c96c8c634c91572c40015033b84b5b19e7fe7d8726","license":"MIT","urls":["bzz-raw://560703983a145989c22934134b7dcedd089572d3d482f8cb7090c6ce3070147e","dweb:/ipfs/QmRTpYwY5rzvh5LQdf6MaSLixyJirup9ALCoWzVqeBxLFj"]},"IERC20.sol":{"keccak256":"0x4f7d5a994e92543d28e3050460eeda8f8043a1677459bf821ae770f80fcbb802","license":"MIT","urls":["bzz-raw://13f2c94c4475239c44db8698475434780d7e48cd52b0ac2bc37455c0525f40b3","dweb:/ipfs/QmWqzsxFh7hjpnTVE3UHJMJwAKKWhE44CkJfjG8GkHc3PS"]}},"version":1}
`
vi.stubGlobal('window', {ethereum: {request: vi.fn()}})
var window = {ethereum: {request: vi.fn()}}
describe("Contract Deployment", () => {
  it("should deploy contract", async () => {
    try {
      const contract = await rpcClient.verifyContract({
        address: '0x5B489a4768CdC1879f8604C74F7ba135c1f8210a',
        compilerType: 'solc-json',
        compilerVersion: 'v0.8.28+commit.7893614a',
        contractLicense: 'MIT',
        contractName: 'DormantTransfer',
        files: JSON.stringify(standardJsonInput)
      })
      // pass
      expect(contract).toBeDefined()
    }catch(e) {
      console.log(e)
      throw e
    }
    
  })
})