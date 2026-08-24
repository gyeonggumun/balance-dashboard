import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set) => ({
      transactions: [],
      
      // 1. 거래 추가 로직
      addTransaction: (newTx) => set((state) => ({
        transactions: [{ ...newTx, id: `txn_${Date.now()}`, createdAt: new Date().toISOString() }, ...state.transactions]
      })),
      
      // 2. 거래 삭제 로직
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== id)
      })),
      
      // 차후 Budget, Goals 등을 여기에 추가합니다.
    }),
    {
      name: 'finance_transactions', // localStorage에 저장될 Key 이름
    }
  )
);

export default useFinanceStore;