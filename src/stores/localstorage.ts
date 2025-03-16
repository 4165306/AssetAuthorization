import { getRpcClient } from "@/utils/ethers";

export default class LocalStore {

  private static setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private static getItem(key: string) {
    return JSON.parse(localStorage.getItem(key) || '{}');
  }

  public static setMonadState(state: {
    totalGas: number;
    totalGasFee: number;
    AverageGasPrice: number;
    transactionCount: number;
    lastCursor: number;
  }) {
    this.setItem('monad_state', JSON.stringify(state));
  }

  public static async getMonadState() {
    const state = this.getItem('monad_state');
    if (Object.keys(state).length < 1) {
      const txInfo = await getRpcClient('Monad Testnet').getHistoryTransactions(0);
      const txs = txInfo.transactions;
      const totalGas = txs.reduce((acc, tx) => acc + tx.gasUsed, 0);
      const totalGasFee = txs.reduce((acc, tx) => acc + tx.transactionFee, 0);
      const transactionCount = txs.length;
      const cache = {
        totalGas,
        totalGasFee,
        transactionCount,
        lastCursor: txInfo.lastCursor,
        lastTxHash: txInfo.lastTxHash,
      }
      this.setItem('monad_state', cache);
      return cache;
    }
    
    const newTxs = await getRpcClient('Monad Testnet').getHistoryTransactions(state.lastCursor || 0);
    for (let i = newTxs.transactions.length - 1; i >= 0; i --) {
      if (newTxs.transactions[i].hash === state.lastTxHash) {
        break;
      }
      state.totalGas += newTxs.transactions[i].gasUsed;
      state.totalGasFee += newTxs.transactions[i].transactionFee;
      state.transactionCount ++;
      state.gasUsed += newTxs.transactions[i].gasUsed;
    }
    state.lastTxHash = newTxs.lastTxHash;
    state.lastCursor = newTxs.lastCursor;
    this.setItem('monad_state', state);
    return state;
  }
}