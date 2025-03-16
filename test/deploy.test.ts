import { getRpcClient } from '../src/utils/ethers'
import { describe, expect, it, vi } from 'vitest'

const rpcClient = getRpcClient('Monad Testnet')

vi.stubGlobal('window', {ethereum: {request: vi.fn()}})
describe("Contract Deployment", () => {
  it("should deploy contract", async () => {
    try {
      const contract = await rpcClient.verifyContract({
        address: '0x5B489a4768CdC1879f8604C74F7ba135c1f8210a',
        compilerType: 'solc-json',
        compilerVersion: 'v0.8.28+commit.7893614a',
        contractLicense: 'MIT',
        contractName: 'DormantTransfer',
        files: JSON.stringify({})
      })
      // pass
      expect(contract).toBeDefined()
    }catch(e) {
      console.log(e)
      throw e
    }
    
  })
})