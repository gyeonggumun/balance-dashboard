import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set) => ({
      // --- 1. 거래 내역 (Transactions) ---
      transactions: [],
      addTransaction: (newTx) => set((state) => ({
        transactions: [{ ...newTx, id: `txn_${Date.now()}`, createdAt: new Date().toISOString() }, ...state.transactions]
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== id)
      })),

      // --- 2. 예산 (Budgets) ---
      budgets: {}, 
      setBudget: (month, category, amount) => set((state) => {
        const monthBudgets = state.budgets[month] || {};
        return {
          budgets: {
            ...state.budgets,
            [month]: { ...monthBudgets, [category]: amount }
          }
        };
      }),
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

      // --- 3. 저축 목표 (Goals) ---
      goals: [],
      addGoal: (goal) => set((state) => ({
        goals: [{ ...goal, id: `goal_${Date.now()}`, createdAt: new Date().toISOString() }, ...state.goals]
      })),
      updateGoal: (id, currentAmount) => set((state) => ({
        goals: state.goals.map(goal => 
          goal.id === id ? { ...goal, currentAmount: Number(currentAmount) } : goal
        )
      })),
      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(goal => goal.id !== id)
      })),
    }),
    {
      name: 'finance_data', 
    }
  )
);

export default useFinanceStore;