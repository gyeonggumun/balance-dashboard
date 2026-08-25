import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set) => ({
      transactions: [],
      // 기존 거래 내역 액션들...
      addTransaction: (newTx) => set((state) => ({
        transactions: [{ ...newTx, id: `txn_${Date.now()}`, createdAt: new Date().toISOString() }, ...state.transactions]
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== id)
      })),

      // --- 새로 추가되는 예산(Budget) 상태 및 액션 ---
      // 구조: { '2026-08': { '식비': 500000, '교통': 100000 } }
      budgets: {}, 
      
      // 예산 설정 및 수정
      setBudget: (month, category, amount) => set((state) => {
        const monthBudgets = state.budgets[month] || {};
        return {
          budgets: {
            ...state.budgets,
            [month]: { ...monthBudgets, [category]: amount }
          }
        };
      }),

      // 예산 삭제
      deleteBudget: (month, category) => set((state) => {
        const monthBudgets = { ...state.budgets[month] };
        delete monthBudgets[category];
        return {
          budgets: {
            ...state.budgets,
            [month]: monthBudgets
          }
        };
      }),
    }),
    {
      name: 'finance_data', // 스토리지가 통합되므로 이름을 변경하거나 유지합니다.
    }
  )
);

export default useFinanceStore;