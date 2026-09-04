import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFinanceStore = create(
  persist(
    (set) => ({
      // --- 0. 테마 (다크 모드) 설정 ---
      theme: 'light',
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),

      // --- 1. 사용자 지정 카테고리 (Categories) ---
      categories: {
        expense: ['식비', '교통', '쇼핑', '주거', '통신', '구독', '의료', '여가', '교육', '기타'],
        income: ['급여', '부수입', '용돈', '환급', '기타']
      },
      addCategory: (type, category) => set((state) => {
        if (state.categories[type].includes(category)) return state;
        return {
          categories: {
            ...state.categories,
            [type]: [...state.categories[type], category]
          }
        };
      }),
      deleteCategory: (type, category) => set((state) => ({
        categories: {
          ...state.categories,
          [type]: state.categories[type].filter(c => c !== category)
        }
      })),

      // --- 2. 거래 내역 (Transactions) ---
      transactions: [],
      addTransaction: (newTx) => set((state) => ({
        transactions: [{ ...newTx, id: `txn_${Date.now()}`, createdAt: new Date().toISOString() }, ...state.transactions]
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== id)
      })),
      // CSV에서 불러온 대량의 거래 내역을 한 번에 추가하고 날짜순 정렬
      importTransactions: (importedTxs) => set((state) => ({
        transactions: [...importedTxs, ...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      })),

      // --- 3. 예산 (Budgets) ---
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

      // --- 4. 저축 목표 (Goals) ---
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

      // --- 5. 설정 (Settings) 데이터 관리 ---
      resetAll: () => set(() => ({
        transactions: [],
        budgets: {},
        goals: [],
        categories: {
          expense: ['식비', '교통', '쇼핑', '주거', '통신', '구독', '의료', '여가', '교육', '기타'],
          income: ['급여', '부수입', '용돈', '환급', '기타']
        }
      })),

      restoreData: (parsedData) => set((state) => ({
        transactions: parsedData.transactions || [],
        budgets: parsedData.budgets || {},
        goals: parsedData.goals || [],
        categories: parsedData.categories || state.categories
      })),
    }),
    {
      name: 'finance_data', 
    }
  )
);

export default useFinanceStore;