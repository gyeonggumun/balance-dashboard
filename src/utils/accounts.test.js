import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ACCOUNT_ID, getAccountBalance, normalizeFinanceData } from './accounts.js';

test('기존 거래를 기본 계좌로 유지한다', () => {
  const restored = normalizeFinanceData({ transactions: [
    { id: 'old-1', type: 'income', amount: 3000, date: '2026-09-01' },
    { id: 'txn_csv_1', type: 'expense', amount: 500, date: '2026-09-02' },
  ] });
  assert.equal(restored.accounts[0].id, DEFAULT_ACCOUNT_ID);
  assert.deepEqual(restored.transactions.map((tx) => [tx.accountId, tx.source]), [
    [DEFAULT_ACCOUNT_ID, 'manual'],
    [DEFAULT_ACCOUNT_ID, 'csv'],
  ]);
});

test('계좌 간 이체는 전체 잔액을 바꾸지 않는다', () => {
  const first = { id: 'first', openingBalance: 10000 };
  const second = { id: 'second', openingBalance: 2000 };
  const transactions = [
    { type: 'income', accountId: 'first', amount: 5000 },
    { type: 'expense', accountId: 'first', amount: 3000 },
    { type: 'transfer', accountId: 'first', toAccountId: 'second', amount: 4000 },
  ];
  assert.equal(getAccountBalance(first, transactions), 8000);
  assert.equal(getAccountBalance(second, transactions), 6000);
});

test('CSV 중복 거래와 거래가 있는 계좌의 삭제를 막는다', async () => {
  const saved = new Map();
  saved.set('finance_data', JSON.stringify({ version: 0, state: {
    transactions: [{ id: 'legacy', type: 'income', amount: 100, date: '2026-09-01' }],
  } }));
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: (key) => saved.delete(key),
    },
  });
  globalThis.window = { localStorage: globalThis.localStorage };
  const { default: useFinanceStore } = await import('../store/financeStore.js');
  await useFinanceStore.persist.rehydrate();
  assert.equal(useFinanceStore.getState().transactions[0].accountId, DEFAULT_ACCOUNT_ID);
  useFinanceStore.getState().resetAll();
  useFinanceStore.getState().addAccount('저축', 1000);
  const account = useFinanceStore.getState().accounts.at(-1);
  const imported = { id: 'csv-1', accountId: account.id, type: 'income', amount: 500, date: '2026-09-01', source: 'csv', sourceKey: 'same-row' };
  assert.equal(useFinanceStore.getState().importTransactions([imported]), 1);
  assert.equal(useFinanceStore.getState().importTransactions([{ ...imported, id: 'csv-2' }]), 0);
  useFinanceStore.getState().deleteAccount(account.id);
  assert.ok(useFinanceStore.getState().accounts.some((item) => item.id === account.id));
  assert.equal(getAccountBalance(account, useFinanceStore.getState().transactions), 1500);
});
