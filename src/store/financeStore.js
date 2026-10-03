import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_ACCOUNT, DEFAULT_ACCOUNT_ID, normalizeFinanceData } from '../utils/accounts.js';

const makeId = () => crypto.randomUUID();

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
      accounts: [DEFAULT_ACCOUNT],
      addAccount: (name, openingBalance) => set((state) => ({
        accounts: [...state.accounts, { id: makeId(), name: name.trim(), openingBalance: Number(openingBalance) || 0 }],
      })),
      updateAccount: (id, name, openingBalance) => set((state) => ({
        accounts: state.accounts.map((account) => account.id === id
          ? { ...account, name: name.trim(), openingBalance: Number(openingBalance) || 0 }
          : account),
      })),
      deleteAccount: (id) => set((state) => {
        if (id === DEFAULT_ACCOUNT_ID || state.transactions.some((transaction) =>
          transaction.accountId === id || transaction.toAccountId === id)) return state;
        return { accounts: state.accounts.filter((account) => account.id !== id) };
      }),
      transactions: [],
      addTransaction: (newTx) => set((state) => ({
        transactions: [{ ...newTx, id: makeId(), source: 'manual', createdAt: new Date().toISOString() }, ...state.transactions]
      })),
      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(tx => tx.id !== id)
      })),
      // CSV에서 불러온 대량의 거래 내역을 한 번에 추가하고 날짜순 정렬
      importTransactions: (importedTxs) => {
        let added = 0;
        set((state) => {
          const existingIds = new Set(state.transactions.map((tx) => tx.id));
          const existingKeys = new Set(state.transactions.filter((tx) => tx.sourceKey)
            .map((tx) => `${tx.accountId}:${tx.source}:${tx.sourceKey}`));
          const accounts = new Set(state.accounts.map((account) => account.id));
          const unique = importedTxs.filter((tx) => {
            if (!accounts.has(tx.accountId) || existingIds.has(tx.id)) return false;
            const key = tx.sourceKey && `${tx.accountId}:${tx.source}:${tx.sourceKey}`;
            if (key && existingKeys.has(key)) return false;
            existingIds.add(tx.id);
            if (key) existingKeys.add(key);
            return true;
          });
          added = unique.length;
          return { transactions: [...unique, ...state.transactions].sort((a, b) => b.date.localeCompare(a.date)) };
        });
        return added;
      },

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
        accounts: [DEFAULT_ACCOUNT],
        transactions: [],
        budgets: {},
        goals: [],
        categories: {
          expense: ['식비', '교통', '쇼핑', '주거', '통신', '구독', '의료', '여가', '교육', '기타'],
          income: ['급여', '부수입', '용돈', '환급', '기타']
        }
      })),

      restoreData: (parsedData) => set((state) => ({
        ...normalizeFinanceData(parsedData),
        budgets: parsedData.budgets || {},
        goals: parsedData.goals || [],
        categories: parsedData.categories || state.categories
      })),
    }),
    {
      name: 'finance_data', 
      version: 1,
      migrate: (savedState) => ({ ...savedState, ...normalizeFinanceData(savedState) }),
    }
  )
);

export default useFinanceStore;
