import { vi } from 'vitest'

// 模拟 window.ethereum
const ethereum = {
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
  // 添加其他需要的方法
}

// 模拟全局对象
vi.stubGlobal('window', {
  ethereum
})