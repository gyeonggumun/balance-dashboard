import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set) => ({
      transactions: [],
      // 거래 추가 (CRUD 중 C)
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),
      // 거래 삭제 (CRUD 중 D)
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),
      // 추후 Budget, Goals 상태도 여기에 추가
    }),
    {
      name: 'finance_transactions', // localStorage 키 이름 [cite: 80]
    }
  )
);

export default useFinanceStore;