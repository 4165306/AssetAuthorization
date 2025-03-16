// 预定义的常用依赖
const COMMON_DEPENDENCIES = {
  '@openzeppelin/contracts/token/ERC20/IERC20.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    interface IERC20 {
        function balanceOf(address account) external view returns (uint256);
        function approve(address spender, uint256 amount) external returns (bool);
        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    }
  `,
  '@openzeppelin/contracts/access/Ownable.sol': `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    contract Ownable {
        address private _owner;
        event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
        constructor() {
            _owner = msg.sender;
            emit OwnershipTransferred(address(0), msg.sender);
        }
        function owner() public view returns (address) {
            return _owner;
        }
        modifier onlyOwner() {
            require(_owner == msg.sender, "Ownable: caller is not the owner");
            _;
        }
        function transferOwnership(address newOwner) public onlyOwner {
            require(newOwner != address(0), "Ownable: new owner is the zero address");
            emit OwnershipTransferred(_owner, newOwner);
            _owner = newOwner;
        }
    }
  `
  // 可以继续添加其他常用依赖
}

// 解析导入语句
function findImports(code) {
  const importRegex = /import\s+["']([^"']+)["']/g
  const imports = []
  let match

  while ((match = importRegex.exec(code)) !== null) {
    imports.push(match[1])
  }

  return imports
}

// 准备编译输入
function prepareInput(contractCode) {
  const sources = {}
  const imports = findImports(contractCode)
  
  // 添加主合约
  sources['DormantTransfer.sol'] = { content: contractCode }
  
  // 添加依赖
  for (const importPath of imports) {
    if (COMMON_DEPENDENCIES[importPath]) {
      const fileName = importPath.split('/').pop()
      sources[fileName] = { content: COMMON_DEPENDENCIES[importPath] }
      // 替换导入路径
      sources['DormantTransfer.sol'].content = sources['DormantTransfer.sol'].content
        .replace(importPath, fileName)
    } else {
      console.warn(`Unknown dependency: ${importPath}`)
    }
  }
  
  return {
    language: 'Solidity',
    sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "metadata"], // 添加 metadata 输出
          "": ["ast"] // 可选：如果需要 AST
        }
      },
      optimizer: {
        enabled: false,
        runs: 200
      },
      evmVersion: "london",
      metadata: {
        bytecodeHash: "ipfs"
      }
    }
  }
}

const loadSolc = async (self) => {
  importScripts('https://binaries.soliditylang.org/emscripten-wasm32/solc-emscripten-wasm32-v0.8.29+commit.ab55807c.js')
  return self.Module
}

self.onmessage = async (e) => {
  const { contractCode } = e.data
  try {
    // 发送开始编译消息
    self.postMessage({ type: 'progress', data: 'Starting compilation...' })

    // 加载编译器
    self.postMessage({ type: 'progress', data: 'Loading compiler...' })
    importScripts('https://binaries.soliditylang.org/bin/soljson-v0.8.19+commit.7dd6d404.js')
    
    // 准备编译输入
    self.postMessage({ type: 'progress', data: 'Preparing input...' })
    const input = prepareInput(contractCode)
    
    // 开始编译
    // @ts-ignore
    const compile = self.Module.cwrap('solidity_compile', 'string', ['string'])
    self.postMessage({ type: 'progress', data: 'Compiling contract...' })
    const output = JSON.parse(compile(JSON.stringify(input)))
    
    // 检查编译结果
    if (output.errors) {
      throw new Error(output.errors.map((e) => e.message).join('\n'))
    }

    const contract = output.contracts['DormantTransfer.sol'].DormantTransfer
    
    // 发送编译成功消息，包含 metadata
    self.postMessage({
      type: 'success',
      data: {
        ...contract,
        metadata: contract.metadata // metadata 是 JSON 字符串，需要解析
      }
    })
  } catch (error) {
    // 发送错误消息
    self.postMessage({
      type: 'error',
      data: (error).message
    })
  }
}
